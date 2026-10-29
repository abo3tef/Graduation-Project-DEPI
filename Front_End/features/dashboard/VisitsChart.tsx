"use client";

import { useId, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatDayMonth, formatWeekday } from "@/lib/clinic-dates";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { VisitsPoint, VisitsRange } from "@/types/api";

export function VisitsChart({
  week,
  fourWeeks,
}: {
  week: VisitsPoint[];
  fourWeeks: VisitsPoint[];
}) {
  const t = useTranslations("dashboard.visits");
  const locale = useLocale() as Locale;
  const [range, setRange] = useState<VisitsRange>("week");
  const id = useId();

  const points = range === "week" ? week : fourWeeks;
  const max = Math.max(1, ...points.map((point) => point.value));
  const axis = [max, Math.round(max / 2), 0];

  return (
    <section
      className="rounded-2xl border border-border bg-surface p-4 sm:p-5"
      aria-labelledby={`${id}-title`}
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id={`${id}-title`} className="text-base font-bold">
            {t("title")}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{t("axis")}</p>
        </div>

        <div
          role="tablist"
          aria-label={t("rangeLabel")}
          className="flex rounded-xl border border-border bg-surface-2 p-0.5"
        >
          {(["week", "4weeks"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={range === option}
              onClick={() => setRange(option)}
              className={cn(
                "rounded-[10px] px-3 py-1.5 text-[11px] font-bold transition sm:text-xs",
                range === option
                  ? "bg-primary/15 text-primary"
                  : "text-muted hover:text-foreground",
              )}
            >
              {option === "week" ? t("week") : t("fourWeeks")}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <div
          className="flex h-52 flex-col justify-between pb-6 text-[10px] font-semibold text-muted"
          aria-hidden="true"
        >
          {axis.map((value, index) => (
            <span key={index}>{formatNumber(value, locale)}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between"
          >
            {axis.map((_, index) => (
              <span key={index} className="block border-t border-border/60" />
            ))}
          </div>

          <div className="relative flex h-52 items-end gap-2 sm:gap-3">
            {points.map((point) => {
              const label =
                range === "week"
                  ? formatWeekday(point.date, locale)
                  : formatDayMonth(point.date, locale);
              const fullLabel =
                range === "week"
                  ? formatWeekday(point.date, locale)
                  : formatDayMonth(point.date, locale);
              const height =
                point.value === 0
                  ? 3
                  : Math.max(8, Math.round((point.value / max) * 100));

              return (
                <div
                  key={point.date}
                  tabIndex={0}
                  aria-label={t("tooltip", {
                    day: fullLabel,
                    count: point.value,
                  })}
                  className="group relative flex h-full min-w-0 flex-1 flex-col justify-end pb-6 outline-none"
                >
                  <div
                    className="pointer-events-none absolute bottom-[calc(100%-1rem)] start-1/2 z-20 hidden -translate-x-1/2 translate-y-1 whitespace-nowrap rounded-lg border border-border bg-surface-3 px-2.5 py-1.5 text-[11px] font-semibold shadow-xl group-hover:block group-focus:block rtl:translate-x-1/2"
                  >
                    {t("tooltip", { day: fullLabel, count: point.value })}
                  </div>

                  <div className="relative flex h-full w-full items-end justify-center">
                    <div
                      className={cn(
                        "w-full max-w-12 rounded-t-lg border border-b-0 transition",
                        point.value > 0
                          ? "border-primary/25 bg-gradient-to-t from-primary/25 to-primary/80 group-hover:from-primary/40 group-hover:to-primary"
                          : "border-border bg-border/50",
                      )}
                      style={{ height: `${height}%` }}
                    />
                  </div>

                  <span className="absolute inset-x-0 bottom-0 truncate text-center text-[10px] font-semibold text-muted group-hover:text-foreground">
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
