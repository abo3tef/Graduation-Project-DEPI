import type { Locale } from "@/i18n/routing";

export function toLocale(value: unknown): Locale {
  return value === "en" ? "en" : "ar";
}
