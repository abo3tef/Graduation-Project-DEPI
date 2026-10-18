import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";

export default async function HomePage({
  params,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <main className="page-shell">
      <section className="welcome-card" aria-labelledby="welcome-title">
        <div className="card-top">
          <p className="eyebrow">{t("eyebrow")}</p>
          <LanguageSwitcher />
        </div>
        <h1 id="welcome-title">{t("title")}</h1>
        <p className="description">{t("description")}</p>
        <div className="scope-list" aria-label={t("scopeLabel")}>
          <span>{t("patients")}</span>
          <span>{t("appointments")}</span>
          <span>{t("medicalRecords")}</span>
          <span>{t("timeline")}</span>
        </div>
      </section>
    </main>
  );
}
