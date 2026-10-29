import type { ReactNode } from "react";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import { SecretaryGuard } from "@/features/secretaries/components/SecretaryGuard";
import { SecretaryNav } from "@/features/secretaries/components/SecretaryNav";

export default async function SecretaryLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container grid gap-6 py-8">
      <SecretaryNav />
      <Suspense fallback={null}>
        <SecretaryGuard locale={locale}>{children}</SecretaryGuard>
      </Suspense>
    </div>
  );
}
