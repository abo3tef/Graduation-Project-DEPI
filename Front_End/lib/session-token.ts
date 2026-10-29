import { USER_ROLES, type UserRole } from "@/constants/roles";

/**
 * AUTH INTEGRATION CONTRACT (frontend side) — to be confirmed with the authentication owner.
 *  - The signed-in user's access token (JWT) is available in the cookie named below.
 *  - The token carries the user id in `sub` (or the .NET NameIdentifier claim) and the role in
 *    `role` (or the .NET Role claim): "Doctor" | "Secretary" | "Admin", case-insensitive.
 * The payload is decoded WITHOUT verifying the signature. It is used only to pick navigation and
 * redirects; the API verifies the token and enforces every permission.
 */
export const ACCESS_TOKEN_COOKIE = "medilog_access_token";

const ROLE_CLAIM_KEYS = [
  "role",
  "roles",
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role",
];
const ID_CLAIM_KEYS = [
  "sub",
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
];

export interface SessionUser {
  id: string;
  role: UserRole;
}

function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      Array.from(atob(base64), (c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`).join(""),
    );
    const payload: unknown = JSON.parse(json);
    return payload && typeof payload === "object" ? (payload as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function firstString(payload: Record<string, unknown>, keys: string[]): string[] {
  return keys.flatMap((key) => {
    const value = payload[key];
    if (typeof value === "string") return [value];
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
    return [];
  });
}

/** Expired or malformed tokens yield null. If several roles are present, secretary wins (most restrictive). */
export function getSessionUserFromToken(token: string | undefined | null): SessionUser | null {
  if (!token) return null;
  const payload = decodePayload(token);
  if (!payload) return null;

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) return null;

  const roles = firstString(payload, ROLE_CLAIM_KEYS)
    .map((r) => r.toLowerCase())
    .filter((r): r is UserRole => (USER_ROLES as readonly string[]).includes(r));
  const id = firstString(payload, ID_CLAIM_KEYS)[0];
  if (!id || roles.length === 0) return null;

  const role = roles.includes("secretary") ? "secretary" : roles[0];
  return { id, role };
}
