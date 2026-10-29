import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  return {
    locale,
    timeZone: "Africa/Cairo",
    formats: {
      dateTime: {
        short: {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          numberingSystem: "latn",
        },
        time: {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          numberingSystem: "latn",
        },
        weekdayShort: {
          weekday: "short",
          numberingSystem: "latn",
        },
        dayMonth: {
          day: "numeric",
          month: "short",
          numberingSystem: "latn",
        },
        fullDate: {
          day: "numeric",
          month: "short",
          year: "numeric",
          numberingSystem: "latn",
        },
        longDate: {
          weekday: "long",
          day: "numeric",
          month: "long",
          numberingSystem: "latn",
        },
      },
      number: {
        integer: {
          maximumFractionDigits: 0,
          numberingSystem: "latn",
        },
      },
    },
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
