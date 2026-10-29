/**
 * Date-only helpers for the clinic. All "dates" are YYYY-MM-DD strings in
 * Africa/Cairo wall time, so they never shift with the browser timezone.
 */

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function isValidDateString(value: string | undefined): value is string {
  return Boolean(value && DATE_PATTERN.test(value));
}

export function clinicToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function toUtcDate(value: string): Date {
  return new Date(`${value}T00:00:00Z`);
}

export function addDays(value: string, days: number): string {
  const date = toUtcDate(value);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Sunday-first week start, matching the clinic week. */
export function startOfWeek(value: string): string {
  const date = toUtcDate(value);
  return addDays(value, -date.getUTCDay());
}

export function weekDays(start: string): string[] {
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

export function weekdayIndex(value: string): number {
  return toUtcDate(value).getUTCDay();
}

/** Date-only display through a UTC noon anchor so the day never shifts. */
export function formatDateOnly(
  value: string,
  locale: "ar" | "en",
  options: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
    timeZone: "UTC",
    ...options,
  }).format(new Date(`${value}T12:00:00Z`));
}

export function formatWeekday(value: string, locale: "ar" | "en"): string {
  return formatDateOnly(value, locale, { weekday: "short" });
}

export function formatDayMonth(value: string, locale: "ar" | "en"): string {
  return formatDateOnly(value, locale, { day: "numeric", month: "short" });
}

export function formatLongDateOnly(value: string, locale: "ar" | "en"): string {
  return formatDateOnly(value, locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}
export function formatFullDate(
  value: string,
  locale: "ar" | "en",
): string {
  return formatDateOnly(value, locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Converts a Cairo wall-clock date/time into a UTC instant. The offset is read
 * from Intl so daylight saving transitions are handled by the timezone database.
 */
export function cairoWallTimeToUtc(date: string, time: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  const wallAsUtc = Date.UTC(year, month - 1, day, hour, minute);

  const offsetMilliseconds = (instant: number) => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "Africa/Cairo",
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).formatToParts(new Date(instant));

    const get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value ?? 0);

    const represented = Date.UTC(
      get("year"),
      get("month") - 1,
      get("day"),
      get("hour"),
      get("minute"),
      get("second"),
    );

    return represented - instant;
  };

  let guess = wallAsUtc - offsetMilliseconds(wallAsUtc);
  guess = wallAsUtc - offsetMilliseconds(guess);
  return new Date(guess);
}

export function toDateInputValue(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

export function toTimeInputValue(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}
