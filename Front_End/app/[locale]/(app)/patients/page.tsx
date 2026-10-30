import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FiSearch, FiUsers } from "react-icons/fi";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { PatientSearch } from "@/features/patients/PatientSearch";
import { AddPatientButton } from "@/features/patients/AddPatientButton";
import { PatientsTable } from "@/features/patients/PatientsTable";
import { PatientsPagination } from "@/features/patients/PatientsPagination";
import { requireSession } from "@/data/auth/session";
import { getAssignedDoctors, searchPatients } from "@/data/patients/queries";
import { toLocale } from "@/lib/locale";
import {
  DEFAULT_PATIENT_SORT,
  hasActiveFilters,
  parseAge,
  parseGender,
  patientsHref,
  type PatientListFilters,
} from "@/lib/patients-url";
import { Link, redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { PatientSort } from "@/types/api";

export const instant = false;

const SORTS: readonly PatientSort[] = [
  "lastVisit_desc",
  "lastVisit_asc",
  "name_asc",
  "name_desc",
  "code_asc",
  "code_desc",
  "age_asc",
  "age_desc",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "patients" });
  return { title: t("title") };
}

export default async function PatientsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale: rawLocale }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const locale: Locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const search =
    typeof query.q === "string" ? query.q.trim().slice(0, 100) : "";
  const minAge = parseAge(query.minAge);
  const maxAge = parseAge(query.maxAge);
  const filters: PatientListFilters = {
    search,
    gender: parseGender(query.gender),
    minAge,
    // An inverted range would be rejected by the API; keep the lower bound only.
    maxAge:
      minAge !== undefined && maxAge !== undefined && maxAge < minAge
        ? undefined
        : maxAge,
  };

  const requestedSort = typeof query.sort === "string" ? query.sort : "";
  const sort: PatientSort = (SORTS as readonly string[]).includes(requestedSort)
    ? (requestedSort as PatientSort)
    : DEFAULT_PATIENT_SORT;
  const parsedPage = Number.parseInt(
    typeof query.page === "string" ? query.page : "1",
    10,
  );
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 10;

  const session = await requireSession(locale);
  const [result, doctors] = await Promise.all([
    searchPatients(locale, {
      search: filters.search || undefined,
      gender: filters.gender || undefined,
      minAge: filters.minAge,
      maxAge: filters.maxAge,
      page,
      pageSize,
      sort,
    }),
    getAssignedDoctors(locale),
  ]);

  if (result.total > 0 && result.items.length === 0 && page > 1) {
    const lastPage = Math.max(1, result.totalPages);
    redirect({ href: patientsHref(filters, sort, lastPage), locale });
  }

  const t = await getTranslations({ locale, namespace: "patients" });
  const common = await getTranslations({ locale, namespace: "common" });
  const isFiltered = hasActiveFilters(filters);
  // Secretaries handle basic patient information only; visits belong to the medical record.
  const showLastVisit = session.role !== "secretary";

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={<AddPatientButton doctors={doctors} />}
      />

      <div className="mb-4">
        <PatientSearch
          initial={filters}
          sort={sort}
          placeholder={t("searchPlaceholder")}
          label={t("searchLabel")}
          clearLabel={t("clearSearch")}
        />
      </div>

      {result.items.length === 0 ? (
        <EmptyState
          icon={<FiUsers aria-hidden="true" className="size-5" />}
          title={isFiltered ? t("noResultsTitle") : t("emptyTitle")}
          description={
            isFiltered ? t("noResultsDescription") : t("emptyDescription")
          }
          action={
            isFiltered ? (
              <Link
                href="/patients"
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-bold text-muted transition hover:text-foreground"
              >
                <FiSearch aria-hidden="true" className="size-3.5" />
                {common("clearSearch")}
              </Link>
            ) : (
              <AddPatientButton doctors={doctors} />
            )
          }
        />
      ) : (
        <>
          <PatientsTable
            patients={result.items}
            locale={locale}
            sort={sort}
            filters={filters}
            showLastVisit={showLastVisit}
          />
          <PatientsPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            filters={filters}
            sort={sort}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}
