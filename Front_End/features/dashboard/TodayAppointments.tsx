import { getTranslations } from "next-intl/server";
import { FiArrowRight, FiCalendar } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/features/appointments/components/status-badge";
import { formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { TodayAppointment } from "@/types/api";

export async function TodayAppointments({
  items,
  locale,
}: {
  items: TodayAppointment[];
  locale: Locale;
}) {
  const t = await getTranslations({ locale, namespace: "dashboard.today" });
  const reasons = await getTranslations({
    locale,
    namespace: "appointments.reasons",
  });

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">{t("title")}</h2>
        <Link
          href="/appointments"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
        >
          {t("viewAll")}
          <FiArrowRight
            aria-hidden="true"
            className="size-3 rtl:-scale-x-100"
          />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="grid flex-1 place-items-center rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <FiCalendar aria-hidden="true" className="size-4" />
          </span>
          <p className="mt-3 text-xs text-muted">{t("empty")}</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border border-border/70 bg-surface-2/50 px-3 py-2.5",
                "transition hover:border-primary/25",
              )}
            >
              <span className="w-14 shrink-0 rounded-lg bg-surface px-1.5 py-1 text-center text-[11px] font-bold tabular-nums text-primary">
                {formatTime(item.startsAt, locale)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold">
                  {item.patientName}
                </span>
                <span className="block truncate text-[11px] text-muted">
                  {reasons(item.reason)}
                </span>
              </span>
              <StatusBadge status={item.status} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
