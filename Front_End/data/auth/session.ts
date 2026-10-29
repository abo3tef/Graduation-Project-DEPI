import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { USER_ROLES, type UserRole } from "@/constants/roles";
import { apiRequest } from "@/data/api/client";
import type { UserDto } from "@/types/api";
export const SESSION_COOKIE = "medilog_session";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
  expiresAt: Date;
}

interface JwtPayload {
  sub?: string;
  role?: string;
  name?: string;
  email?: string;
  exp?: number;
}

function decodePayload(token: string): JwtPayload | null {
  const segment = token.split(".")[1];
  if (!segment) {
    return null;
  }

  try {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const json = Buffer.from(normalized, "base64").toString("utf8");
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}



/** Reads and validates the httpOnly session cookie. Returns null when absent or expired. */
export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const user = await apiRequest<UserDto>("/api/v1/auth/me", {
      method: "GET",
      token,
      locale: "en",
      cache: "no-store",
    });

    const payload = decodePayload(token);

    if (!payload?.exp) {
      return null;
    }

    const expiresAt = new Date(payload.exp * 1000);

    if (expiresAt.getTime() <= Date.now()) {
      return null;
    }

    if (!(USER_ROLES as readonly string[]).includes(user.role)) {
      return null;
    }

    return {
      id: user.id,
      name: user.fullName,
      email: user.email,
      role: user.role,
      token,
      expiresAt,
    };
  } catch {
    return null;
  }
}





/** Guards an authenticated route and sends visitors to the localized login page. */
export async function requireSession(locale: Locale): Promise<SessionUser> {
  const session = await getSession();

  if (!session) {
    redirect({ href: "/login", locale });
    throw new Error("Authentication required");
  }

  return session;
}

export async function setSessionCookie(
  token: string,
  expiresAt: string,
): Promise<void> {
  const expires = new Date(expiresAt);
  const store = await cookies();

  store.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: Number.isNaN(expires.getTime())
      ? new Date(Date.now() + 8 * 60 * 60 * 1000)
      : expires,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
