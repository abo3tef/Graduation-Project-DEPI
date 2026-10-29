import type { UserRole } from "@/constants/roles";
import { routing } from "@/i18n/routing";

/**
 * Route-level role rules (UX only). Backend authorization is the real security boundary:
 * hiding or redirecting here never replaces the server-side checks.
 */

/** Any path segment matching one of these is a medical-record screen. Secretaries are always refused. */
export const MEDICAL_RECORD_SEGMENTS = [
  "medical-records",
  "records",
  "visits",
  "diagnoses",
  "medications",
  "prescriptions",
  "allergies",
  "chronic-conditions",
  "vital-signs",
  "lab-results",
  "laboratory-results",
  "notes",
  "documents",
  "timeline",
] as const;

const ROLE_ROOTS: Record<string, UserRole> = {
  doctor: "doctor",
  secretary: "secretary",
  admin: "admin",
};

export type AccessDecision = "allow" | "login" | "forbidden";

export function stripLocale(pathname: string): { locale: string | null; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hasLocale = (routing.locales as readonly string[]).includes(first ?? "");
  const rest = hasLocale ? segments.slice(1) : segments;
  return { locale: hasLocale ? first : null, path: `/${rest.join("/")}` };
}

export function getHomePathForRole(role: UserRole | null): string {
  if (role === "secretary") return "/secretary/account";
  return "/";
}

/** `path` must already be locale-free, e.g. "/secretary/account". */
export function getAccessDecision(role: UserRole | null, path: string): AccessDecision {
  const segments = path.toLowerCase().split("/").filter(Boolean);
  const requiredRole = ROLE_ROOTS[segments[0] ?? ""];
  const isMedicalRecordPath = segments.some((s) =>
    (MEDICAL_RECORD_SEGMENTS as readonly string[]).includes(s),
  );

  if (!requiredRole && !isMedicalRecordPath) return "allow"; // public / other members' routes

  if (role === null) return "login";
  if (role === "secretary" && isMedicalRecordPath) return "forbidden";
  if (requiredRole && role !== requiredRole) return "forbidden";
  return "allow";
}
