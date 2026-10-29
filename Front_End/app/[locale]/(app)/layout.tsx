import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { requireSession } from "@/data/auth/session";
import { AppShell } from "@/features/shell/AppShell";

export const instant = false;

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const session = await requireSession(locale);
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";

  return (
    <AppShell
      user={{ name: session.name, email: session.email, role: session.role }}
      demoMode={demoMode}
    >
      {children}
    </AppShell>
  );
}
