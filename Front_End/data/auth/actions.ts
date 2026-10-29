"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { toLocale } from "@/lib/locale";
import { ApiError, apiRequest } from "@/data/api/client";
import {
  clearSessionCookie,
  getSession,
  setSessionCookie,
} from "@/data/auth/session";
import type { LoginResponse } from "@/types/api";

export interface AuthActionState {
  error?: string;
}

export async function loginAction(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const locale = toLocale(await getLocale());
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "auth.errors.required" };
  }

  try {
    const response = await apiRequest<LoginResponse>("/api/v1/auth/login", {
      method: "POST",
      locale,
      body: { email, password },
    });

    await setSessionCookie(response.token, response.expiresAt);
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        return { error: "auth.errors.rateLimited" };
      }
      if (error.code === "invalid_credentials") {
        return { error: "auth.errors.invalidCredentials" };
      }
      if (error.code === "account_inactive") {
        return { error: "auth.errors.inactive" };
      }
      if (error.code === "network_error") {
        return { error: "errors.network" };
      }
    }

    return { error: "auth.errors.generic" };
  }

  redirect({ href: "/dashboard", locale });
  return {};
}

export async function logoutAction(formData: FormData): Promise<void> {
  const locale = toLocale(formData.get("locale") ?? (await getLocale()));
  await clearSessionCookie();
  redirect({ href: "/login", locale });
}

/** Used by the login page to skip the form for an existing session. */
export async function hasActiveSession(): Promise<boolean> {
  return (await getSession()) !== null;
}
