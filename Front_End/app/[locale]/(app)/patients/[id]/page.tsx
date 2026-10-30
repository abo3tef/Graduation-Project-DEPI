import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  FiArrowLeft,
  FiCalendar,
  FiClipboard,
  FiMapPin,
  FiPhone,
  FiPhoneCall,
  FiUser,
} from "react-icons/fi";
import { Link } from "@/i18n/navigation";
import { EditPatientButton } from "@/features/patients/EditPatientButton";
import { requireSession } from "@/data/auth/session";
import { getPatient } from "@/data/patients/queries";
import { ApiError } from "@/data/api/client";
import { toLocale } from "@/lib/locale";
import {
  formatDateOnly,
  formatFullDate,
} from "@/lib/clinic-dates";
import { getInitial } from "@/lib/format";
import type { Locale } from "@/i18n/routing";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "patients.detail" });
  try {
    const patient = await getPatient(toLocale(locale), id);
    return { title: `${patient.fullName} · ${t("fileTitle")}` };
  } catch {
    return { title: t("fileTitle") };
  }
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-surface-2/40 px-3 py-2.5">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[11px] text-muted">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale: rawLocale, id } = await params;
  const locale: Locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const session = await requireSession(locale);
  // Secretaries see basic patient information only: no clinical notes, no visit history.
  const showMedicalSummary = session.role !== "secretary";

  let patient;
  try {
    patient = await getPatient(locale, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const t = await getTranslations({ locale, namespace: "patients.detail" });
  const tPatients = await getTranslations({ locale, namespace: "patients" });
  const common = await getTranslations({ locale, namespace: "common" });

  return (
    <div>
      <Link
        href="/patients"
        className="mb-5 inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-foreground"
      >
        <FiArrowLeft
          aria-hidden="true"
          className="size-3.5 rtl:-scale-x-100"
        />
        {t("back")}
      </Link>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-primary/12 text-2xl font-extrabold text-primary">
            {getInitial(patient.fullName)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wide text-primary">
              {t("fileTitle")}
            </p>
            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
              {patient.fullName}
            </h2>
            <p className="mt-1 text-xs text-muted">
              <span dir="ltr" className="font-mono">
                {patient.code}
              </span>
              <span className="mx-1.5">•</span>
              {tPatients(`gender.${patient.gender}`)}
              <span className="mx-1.5">•</span>
              {common("age", { age: patient.age })}
            </p>
          </div>
          <EditPatientButton patient={patient} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-border bg-surface p-5">
          <h3 className="mb-4 text-sm font-bold">{t("infoTitle")}</h3>
          <div className="grid gap-2 sm:grid-cols-2">
            <InfoRow
              icon={<FiPhone aria-hidden="true" className="size-4" />}
              label={t("phone")}
              value={
                patient.phone ? (
                  <span dir="ltr">{patient.phone}</span>
                ) : (
                  "—"
                )
              }
            />
            <InfoRow
              icon={<FiCalendar aria-hidden="true" className="size-4" />}
              label={t("birthDate")}
              value={formatDateOnly(patient.birthDate, locale, {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            <InfoRow
              icon={<FiUser aria-hidden="true" className="size-4" />}
              label={t("gender")}
              value={tPatients(`gender.${patient.gender}`)}
            />
            <InfoRow
              icon={<FiMapPin aria-hidden="true" className="size-4" />}
              label={t("address")}
              value={patient.address ?? "—"}
            />
            <InfoRow
              icon={<FiPhoneCall aria-hidden="true" className="size-4" />}
              label={t("emergencyContact")}
              value={patient.emergencyContact ?? "—"}
            />
            {showMedicalSummary ? (
              <InfoRow
                icon={<FiCalendar aria-hidden="true" className="size-4" />}
                label={t("lastVisit")}
                value={
                  patient.lastVisitAt
                    ? formatFullDate(patient.lastVisitAt, locale)
                    : common("noVisitYet")
                }
              />
            ) : null}
            <InfoRow
              icon={<FiClipboard aria-hidden="true" className="size-4" />}
              label={t("registered")}
              value={formatFullDate(patient.createdAt, locale)}
            />
          </div>
        </section>

        {showMedicalSummary ? (
          <section className="rounded-2xl border border-border bg-surface p-5">
            <h3 className="mb-3 text-sm font-bold">{t("notesTitle")}</h3>
            {patient.notes ? (
              <p className="whitespace-pre-line text-sm leading-7 text-muted">
                {patient.notes}
              </p>
            ) : (
              <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-xs text-muted">
                {t("noNotes")}
              </p>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}
