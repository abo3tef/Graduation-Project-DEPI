import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FiSearch, FiUsers } from "react-icons/fi";
import { PageHeader, EmptyState } from "@/components/ui/page-header";
import { PatientSearch } from "@/features/patients/PatientSearch";
import { AddPatientButton } from "@/features/patients/AddPatientButton";
import { PatientsTable } from "@/features/patients/PatientsTable";
import { PatientsPagination } from "@/features/patients/PatientsPagination";
import { searchPatients } from "@/data/patients/queries";
import { toLocale } from "@/lib/locale";
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
  const requestedSort = typeof query.sort === "string" ? query.sort : "";
  const sort: PatientSort = (SORTS as readonly string[]).includes(requestedSort)
    ? (requestedSort as PatientSort)
    : "lastVisit_desc";
  const parsedPage = Number.parseInt(
    typeof query.page === "string" ? query.page : "1",
    10,
  );
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const pageSize = 10;

  const result = await searchPatients(locale, {
    search: search || undefined,
    page,
    pageSize,
    sort,
  });

  if (result.total > 0 && result.items.length === 0 && page > 1) {
    const lastPage = Math.max(1, result.totalPages);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (sort !== "lastVisit_desc") params.set("sort", sort);
    if (lastPage > 1) params.set("page", String(lastPage));
    const qs = params.toString();
    redirect({ href: `/patients${qs ? `?${qs}` : ""}`, locale });
  }

  const t = await getTranslations({ locale, namespace: "patients" });
  const common = await getTranslations({ locale, namespace: "common" });
  const isFiltered = Boolean(search);

  return (
    <div>
      <PageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actions={<AddPatientButton />}
      />

      <div className="mb-4">
        <PatientSearch
          key={search}
          initial={search}
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
              <AddPatientButton />
            )
          }
        />
      ) : (
        <>
          <PatientsTable
            patients={result.items}
            locale={locale}
            sort={sort}
            search={search}
          />
          <PatientsPagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            pageSize={result.pageSize}
            search={search}
            sort={sort}
            locale={locale}
          />
        </>
      )}
    </div>
  );
}
