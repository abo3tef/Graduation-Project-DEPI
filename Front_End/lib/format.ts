import type { Locale } from "@/i18n/routing";

const CLINIC_TIME_ZONE = "Africa/Cairo";


const INTL_LOCALES: Record<Locale, string> = {
  ar: "ar-EG-u-nu-latn",
  en: "en-GB",
};

function format(
  iso: string,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    timeZone: CLINIC_TIME_ZONE,
    ...options,
  }).format(new Date(iso));
}

/** "10:30 ص" / "10:30 am", for appointment rows. */
export function formatTime(iso: string, locale: Locale): string {
  return format(iso, locale, { hour: "2-digit", minute: "2-digit" });
}

/** "الأحد" / "Sun", for the weekly chart labels. */
export function formatWeekday(iso: string, locale: Locale): string {
  return format(iso, locale, { weekday: "short" });
}

/** "12 سبتمبر" / "12 Sept", for last-visit text and 4-week chart labels. */
export function formatDayMonth(iso: string, locale: Locale): string {
  return format(iso, locale, { day: "numeric", month: "short" });
}

/** "12 سبتمبر 2026" / "12 Sept 2026", when the year matters. */
export function formatFullDate(iso: string, locale: Locale): string {
  return format(iso, locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "الأحد، 18 أكتوبر" / "Sunday, 18 October", for the page subtitle. */
export function formatLongDate(iso: string, locale: Locale): string {
  return format(iso, locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** First character of a name, for avatar circles. Works for Arabic and Latin. */
export function getInitial(fullName: string): string {
  return Array.from(fullName.trim())[0] ?? "";
}