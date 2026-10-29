import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { ACCESS_TOKEN_COOKIE, getSessionUserFromToken, type SessionUser } from "./session-token";

/** Reads the session at request time. Call it inside a <Suspense> boundary (Cache Components). */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  await connection(); // token expiry uses the current time, so this must render at request time
  return getSessionUserFromToken(token);
}

export async function getAccessToken(): Promise<string | null> {
  return (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value ?? null;
}
