import { getTranslations } from "next-intl/server";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { patientsHref, type PatientListFilters } from "@/lib/patients-url";
import type { Locale } from "@/i18n/routing";
import type { PatientSort } from "@/types/api";

export async function PatientsPagination({
  page,
  totalPages,
  total,
  pageSize,
  filters,
  sort,
  locale,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  filters: PatientListFilters;
  sort: PatientSort;
  locale: Locale;
}) {
  const pageHref = (target: number) => patientsHref(filters, sort, target);
  const t = await getTranslations({ locale, namespace: "patients" });
  const common = await getTranslations({ locale, namespace: "common" });

  if (total === 0) {
    return null;
  }

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  const linkClass =
    "inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold transition";
  const disabledClass = "pointer-events-none opacity-40";

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
      <p className="text-[11px] text-muted">
        {t("showing", { from, to, total })}
      </p>

      <div className="flex items-center gap-2">
        {hasPrevious ? (
          <Link
            href={pageHref(page - 1)}
            className={cn(linkClass, "text-muted hover:text-foreground")}
          >
            <FiChevronLeft
              aria-hidden="true"
              className="size-3.5 rtl:-scale-x-100"
            />
            {common("previous")}
          </Link>
        ) : (
          <span className={cn(linkClass, "text-muted", disabledClass)}>
            <FiChevronLeft
              aria-hidden="true"
              className="size-3.5 rtl:-scale-x-100"
            />
            {common("previous")}
          </span>
        )}

        <span className="px-1 text-[11px] font-bold text-muted">
          {t("pageLabel", { page, pages: Math.max(1, totalPages) })}
        </span>

        {hasNext ? (
          <Link
            href={pageHref(page + 1)}
            className={cn(linkClass, "text-muted hover:text-foreground")}
          >
            {common("next")}
            <FiChevronRight
              aria-hidden="true"
              className="size-3.5 rtl:-scale-x-100"
            />
          </Link>
        ) : (
          <span className={cn(linkClass, "text-muted", disabledClass)}>
            {common("next")}
            <FiChevronRight
              aria-hidden="true"
              className="size-3.5 rtl:-scale-x-100"
            />
          </span>
        )}
      </div>
    </div>
  );
}
