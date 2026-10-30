import type { Gender, PatientSort } from "@/types/api";

export const DEFAULT_PATIENT_SORT: PatientSort = "lastVisit_desc";
export const MAX_PATIENT_AGE = 130;

const GENDERS: readonly Gender[] = ["female", "male", "unspecified"];

/** Everything on the patients list that narrows the result, as it appears in the URL. */
export interface PatientListFilters {
  search: string;
  gender: Gender | "";
  minAge?: number;
  maxAge?: number;
}

export function hasActiveFilters(filters: PatientListFilters): boolean {
  return Boolean(
    filters.search ||
      filters.gender ||
      filters.minAge !== undefined ||
      filters.maxAge !== undefined,
  );
}

/** Builds the localized-path-free `/patients?...` link, omitting every default value. */
export function patientsHref(
  filters: PatientListFilters,
  sort: PatientSort,
  page = 1,
): string {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.minAge !== undefined) params.set("minAge", String(filters.minAge));
  if (filters.maxAge !== undefined) params.set("maxAge", String(filters.maxAge));
  if (sort !== DEFAULT_PATIENT_SORT) params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/patients${query ? `?${query}` : ""}`;
}

export function parseGender(value: unknown): Gender | "" {
  return typeof value === "string" && (GENDERS as readonly string[]).includes(value)
    ? (value as Gender)
    : "";
}

/** Whole numbers within 0..130 only; anything else is dropped rather than sent to the API. */
export function parseAge(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d{1,3}$/.test(value.trim())) {
    return undefined;
  }
  const age = Number.parseInt(value, 10);
  return age >= 0 && age <= MAX_PATIENT_AGE ? age : undefined;
}
