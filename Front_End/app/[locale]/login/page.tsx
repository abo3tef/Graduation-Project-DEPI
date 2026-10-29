import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { Link, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LoginForm } from "@/features/auth/LoginForm";
import { getSession } from "@/data/auth/session";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "auth" });
  return { title: t("title") };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  if (await getSession()) {
    redirect({ href: "/dashboard", locale });
  }

  const t = await getTranslations({ locale, namespace: "auth" });
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_20%_0%,rgba(45,212,191,0.16),transparent_70%),radial-gradient(45%_40%_at_100%_100%,rgba(37,99,235,0.14),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(148,163,184,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.06)_1px,transparent_1px)] [background-size:64px_64px]"
      />

      <div className="relative w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-foreground"
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
              <MdOutlineHealthAndSafety
                aria-hidden="true"
                className="size-5"
              />
            </span>
            {t("brand")}
          </Link>
          <LanguageSwitcher />
        </div>

        <div className="rounded-2xl border border-border bg-surface/90 p-6 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">{t("subtitle")}</p>

          <div className="mt-6">
            <LoginForm demoMode={demoMode} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          <Link
            href="/"
            className="font-semibold text-primary underline-offset-4 hover:underline"
          >
            {t("backHome")}
          </Link>
          <span className="mx-2 text-border">•</span>
          {t("tagline")}
        </p>
      </div>
    </main>
  );
}
