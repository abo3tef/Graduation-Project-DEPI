import { getTranslations } from "next-intl/server";
import { FiArrowRight, FiUsers } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { formatDayMonth, getInitial } from "@/lib/format";
import type { Locale } from "@/i18n/routing";
import type { PatientListItem } from "@/types/api";

export async function RecentPatients({
  patients,
  locale,
}: {
  patients: PatientListItem[];
  locale: Locale;
}) {
  const t = await getTranslations({
    locale,
    namespace: "dashboard.recentPatients",
  });
  const common = await getTranslations({ locale, namespace: "common" });

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold">{t("title")}</h2>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
        >
          {t("viewAll")}
          <FiArrowRight
            aria-hidden="true"
            className="size-3 rtl:-scale-x-100"
          />
        </Link>
      </div>

      {patients.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed border-border px-4 py-10 text-center">
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
            <FiUsers aria-hidden="true" className="size-4" />
          </span>
          <p className="mt-3 text-xs text-muted">{t("empty")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border/70">
          {patients.map((patient) => (
            <li
              key={patient.id}
              className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/12 text-xs font-extrabold text-primary">
                {getInitial(patient.fullName)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold">
                  {patient.fullName}
                </span>
                <span className="block truncate text-[11px] text-muted">
                  <span dir="ltr">{patient.code}</span>
                  <span className="mx-1.5">•</span>
                  {patient.lastVisitAt
                    ? `${common("lastVisit")}: ${formatDayMonth(
                        patient.lastVisitAt,
                        locale,
                      )}`
                    : common("noVisitYet")}
                </span>
              </span>
              <Link
                href={`/patients/${patient.id}`}
                className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-muted transition hover:border-primary/40 hover:text-primary"
              >
                {common("openFile")}
                <FiArrowRight
                  aria-hidden="true"
                  className="size-3 rtl:-scale-x-100"
                />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
