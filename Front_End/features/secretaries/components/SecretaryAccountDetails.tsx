import { getTranslations } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { getSecretaryAccount } from "@/data/secretaries";
import { formatFullDate, getInitial } from "@/lib/format";
import { getAccessToken } from "@/lib/session";
import type { Locale } from "@/i18n/routing";

export async function SecretaryAccountDetails({ locale }: { locale: Locale }) {
  const [t, token] = await Promise.all([
    getTranslations({ locale, namespace: "secretary.account" }),
    getAccessToken(),
  ]);

  if (!token) return redirect({ href: "/login", locale });

  const result = await getSecretaryAccount(token);

  if (result.status === "unauthorized") return redirect({ href: "/login", locale });
  if (result.status === "forbidden") return redirect({ href: "/", locale });

  if (result.status === "error") {
    return (
      <p role="alert" className="rounded-xl border border-border bg-surface p-5 text-danger">
        {t("loadError")}
      </p>
    );
  }

  const { account } = result;
  const fields: { label: string; value: string }[] = [
    { label: t("email"), value: account.email },
    { label: t("phone"), value: account.phone || t("notProvided") },
    {
      label: t("status"),
      value: account.accountStatus === "Active" ? t("statusActive") : t("statusInactive"),
    },
    { label: t("createdAt"), value: formatFullDate(account.createdAt, locale) },
  ];

  return (
    <div className="grid gap-6">
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="mb-6 flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-14 place-items-center rounded-full bg-tint text-xl font-bold text-primary"
          >
            {getInitial(account.fullName)}
          </span>
          <div>
            <h2 className="text-xl font-bold">{account.fullName}</h2>
            <p className="text-sm text-muted">{t("role")}</p>
          </div>
        </div>
        <dl className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label}>
              <dt className="text-sm text-muted">{field.label}</dt>
              <dd className="font-semibold break-words">{field.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="mb-1 text-lg font-bold">{t("assignedDoctors")}</h2>
        <p className="mb-4 text-sm text-muted">{t("assignedDoctorsHint")}</p>
        {account.assignedDoctors.length === 0 ? (
          <p className="text-muted">{t("noAssignments")}</p>
        ) : (
          <ul className="grid gap-3">
            {account.assignedDoctors.map((doctor) => (
              <li
                key={doctor.doctorId}
                className="flex items-center justify-between gap-3 rounded-lg border border-border p-3"
              >
                <span className="font-semibold">{doctor.fullName}</span>
                {doctor.specialization && (
                  <span className="text-sm text-muted">{doctor.specialization}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
