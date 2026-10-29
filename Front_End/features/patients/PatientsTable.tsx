import { getTranslations } from "next-intl/server";
import {
  FiArrowRight,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { formatDayMonth, getInitial } from "@/lib/format";
import type { Locale } from "@/i18n/routing";
import type { PatientListItem, PatientSort } from "@/types/api";

const SORT_FIELDS = ["name", "code", "age", "lastVisit"] as const;
type SortField = (typeof SORT_FIELDS)[number];

function splitSort(sort: PatientSort): { field: SortField; dir: "asc" | "desc" } {
  if (sort.startsWith("name")) {
    return { field: "name", dir: sort.endsWith("desc") ? "desc" : "asc" };
  }
  if (sort.startsWith("code")) {
    return { field: "code", dir: sort.endsWith("desc") ? "desc" : "asc" };
  }
  if (sort.startsWith("age")) {
    return { field: "age", dir: sort.endsWith("desc") ? "desc" : "asc" };
  }
  return {
    field: "lastVisit",
    dir: sort.endsWith("asc") ? "asc" : "desc",
  };
}

function nextSort(field: SortField, current: PatientSort): PatientSort {
  const parsed = splitSort(current);
  const direction =
    parsed.field === field ? (parsed.dir === "asc" ? "desc" : "asc") : "asc";
  return `${field}_${direction}` as PatientSort;
}

function patientsHref(search: string, sort: PatientSort): string {
  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (sort !== "lastVisit_desc") params.set("sort", sort);
  const query = params.toString();
  return `/patients${query ? `?${query}` : ""}`;
}

function SortHeader({
  label,
  field,
  sort,
  search,
}: {
  label: string;
  field: SortField;
  sort: PatientSort;
  search: string;
}) {
  const parsed = splitSort(sort);
  const active = parsed.field === field;
  const target = nextSort(field, sort);
  const Icon = active && parsed.dir === "asc" ? FiChevronUp : FiChevronDown;

  return (
    <th
      scope="col"
      aria-sort={
        active ? (parsed.dir === "asc" ? "ascending" : "descending") : "none"
      }
      className="whitespace-nowrap px-3 py-3 text-start"
    >
      <Link
        href={patientsHref(search, target)}
        className={`inline-flex items-center gap-1 font-bold transition hover:text-primary ${
          active ? "text-primary" : "text-muted"
        }`}
      >
        {label}
        <Icon
          aria-hidden="true"
          className={`size-3.5 ${active ? "opacity-100" : "opacity-40"}`}
        />
      </Link>
    </th>
  );
}

export async function PatientsTable({
  patients,
  locale,
  sort,
  search,
}: {
  patients: PatientListItem[];
  locale: Locale;
  sort: PatientSort;
  search: string;
}) {
  const t = await getTranslations({ locale, namespace: "patients" });
  const common = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <div className="hidden overflow-hidden rounded-2xl border border-border bg-surface md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-surface-2/50 text-xs">
              <tr>
                <SortHeader
                  label={t("columns.name")}
                  field="name"
                  sort={sort}
                  search={search}
                />
                <th
                  scope="col"
                  className="whitespace-nowrap px-3 py-3 text-start font-bold text-muted"
                >
                  {t("columns.phone")}
                </th>
                <SortHeader
                  label={t("columns.code")}
                  field="code"
                  sort={sort}
                  search={search}
                />
                <SortHeader
                  label={t("columns.age")}
                  field="age"
                  sort={sort}
                  search={search}
                />
                <th
                  scope="col"
                  className="whitespace-nowrap px-3 py-3 text-start font-bold text-muted"
                >
                  {t("columns.gender")}
                </th>
                <SortHeader
                  label={t("columns.lastVisit")}
                  field="lastVisit"
                  sort={sort}
                  search={search}
                />
                <th scope="col" className="w-px px-3 py-3">
                  <span className="sr-only">{common("openFile")}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="transition hover:bg-surface-2/40"
                >
                  <td className="px-3 py-3">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="flex min-w-0 items-center gap-2.5"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/12 text-[11px] font-extrabold text-primary">
                        {getInitial(patient.fullName)}
                      </span>
                      <span className="truncate font-bold hover:text-primary">
                        {patient.fullName}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">
                    {patient.phone ? (
                      <span dir="ltr">{patient.phone}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3">
                    <span
                      dir="ltr"
                      className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-muted"
                    >
                      {patient.code}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">
                    {common("age", { age: patient.age })}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">
                    {t(`gender.${patient.gender}`)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted">
                    {patient.lastVisitAt
                      ? formatDayMonth(patient.lastVisitAt, locale)
                      : common("noVisitYet")}
                  </td>
                  <td className="px-3 py-3">
                    <Link
                      href={`/patients/${patient.id}`}
                      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-bold text-muted transition hover:border-primary/40 hover:text-primary"
                    >
                      {common("openFile")}
                      <FiArrowRight
                        aria-hidden="true"
                        className="size-3 rtl:-scale-x-100"
                      />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="space-y-3 md:hidden">
        {patients.map((patient) => (
          <li
            key={patient.id}
            className="rounded-2xl border border-border bg-surface p-4"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/12 text-sm font-extrabold text-primary">
                {getInitial(patient.fullName)}
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/patients/${patient.id}`}
                  className="block truncate text-sm font-bold hover:text-primary"
                >
                  {patient.fullName}
                </Link>
                <p className="mt-0.5 text-[11px] text-muted">
                  <span dir="ltr" className="font-mono">
                    {patient.code}
                  </span>
                  <span className="mx-1.5">•</span>
                  {t(`gender.${patient.gender}`)}
                  <span className="mx-1.5">•</span>
                  {common("age", { age: patient.age })}
                </p>
              </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 gap-2 border-t border-border/70 pt-3 text-[11px]">
              <div>
                <dt className="text-muted">{t("columns.phone")}</dt>
                <dd className="mt-0.5 font-semibold" dir="ltr">
                  {patient.phone ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted">{t("columns.lastVisit")}</dt>
                <dd className="mt-0.5 font-semibold">
                  {patient.lastVisitAt
                    ? formatDayMonth(patient.lastVisitAt, locale)
                    : common("noVisitYet")}
                </dd>
              </div>
            </dl>

            <Link
              href={`/patients/${patient.id}`}
              className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1 rounded-xl border border-border text-xs font-bold text-muted transition hover:border-primary/40 hover:text-primary"
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
    </>
  );
}
