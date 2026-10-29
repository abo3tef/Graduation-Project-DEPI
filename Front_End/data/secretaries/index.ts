import "server-only";
import type { SecretaryAccount } from "@/types/secretary";

export type SecretaryAccountResult =
  | { status: "ok"; account: SecretaryAccount }
  | { status: "unauthorized" }
  | { status: "forbidden" }
  | { status: "error" };

/** The API base URL is server-side configuration (not a secret). Example: https://localhost:7000 */
const API_BASE_URL = process.env.API_BASE_URL ?? "";

export async function getSecretaryAccount(accessToken: string): Promise<SecretaryAccountResult> {
  if (!API_BASE_URL) return { status: "error" };

  try {
    const response = await fetch(`${API_BASE_URL}/api/secretary/me`, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
      cache: "no-store",
    });

    if (response.status === 401) return { status: "unauthorized" };
    if (response.status === 403) return { status: "forbidden" };
    if (!response.ok) return { status: "error" };

    return { status: "ok", account: (await response.json()) as SecretaryAccount };
  } catch {
    return { status: "error" };
  }
}
