import { getSession } from "@/data/auth/session";
import { ApiError } from "@/data/api/client";

/**
 * Server-action guard. Actions return an error key instead of redirecting so an
 * expired session never loses the form data silently.
 */
export class ActionSessionError extends Error {
  constructor() {
    super("Your session has expired.");
    this.name = "ActionSessionError";
  }
}

export async function requireActionSession() {
  const session = await getSession();
  if (!session) {
    throw new ActionSessionError();
  }
  return session;
}

export function isNetworkError(error: unknown): boolean {
  return error instanceof ApiError && error.code === "network_error";
}
