import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { SecretaryAccountDetails } from "@/features/secretaries/components/SecretaryAccountDetails";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "secretary.account" });
  return { title: t("title") };
}

export default async function SecretaryAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "secretary.account" });

  return (
    <div className="grid gap-6">
      <header>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted">{t("subtitle")}</p>
      </header>
      <Suspense fallback={<p className="text-muted">{t("loading")}</p>}>
        <SecretaryAccountDetails locale={locale as Locale} />
      </Suspense>
    </div>
  );
}
