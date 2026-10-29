import { cookies } from "next/headers";
import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { USER_ROLES, type UserRole } from "@/constants/roles";

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

function normalizeRole(value: string | undefined): UserRole {
  const role = (value ?? "").toLowerCase();
  return (USER_ROLES as readonly string[]).includes(role)
    ? (role as UserRole)
    : "secretary";
}

/** Reads and validates the httpOnly session cookie. Returns null when absent or expired. */
export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = decodePayload(token);
  if (!payload?.sub || !payload.exp) {
    return null;
  }

  const expiresAt = new Date(payload.exp * 1000);
  if (expiresAt.getTime() <= Date.now()) {
    return null;
  }

  return {
    id: payload.sub,
    name: payload.name ?? payload.email ?? "Medilog",
    email: payload.email ?? "",
    role: normalizeRole(payload.role),
    token,
    expiresAt,
  };
}

/** Guards an authenticated route and sends visitors to the localized login page. */
export async function requireSession(locale: Locale): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    redirect({ href: "/login", locale });
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
