import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FiInfo } from "react-icons/fi";
import { PageHeader } from "@/components/ui/page-header";
import { PendingBanner } from "@/features/dashboard/PendingBanner";
import { StatsGrid } from "@/features/dashboard/StatsGrid";
import { VisitsChart } from "@/features/dashboard/VisitsChart";
import { TodayAppointments } from "@/features/dashboard/TodayAppointments";
import { RecentPatients } from "@/features/dashboard/RecentPatients";
import { getDashboardSummary, getVisits } from "@/data/dashboard/queries";
import { requireSession } from "@/data/auth/session";
import { toLocale } from "@/lib/locale";
import type { Locale } from "@/i18n/routing";

export const instant = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard" });
  return { title: t("title") };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale: Locale = toLocale(rawLocale);
  setRequestLocale(locale);

  const session = await requireSession(locale);

  const [summary, week, fourWeeks, t] = await Promise.all([
    getDashboardSummary(locale),
    getVisits(locale, "week"),
    getVisits(locale, "4weeks"),
    getTranslations({ locale, namespace: "dashboard" }),
  ]);

  const labels: Record<string, string> = {
    totalPatients: t("stats.totalPatients"),
    weeklyVisits: t("stats.weeklyVisits"),
    todayAppointments: t("stats.todayAppointments"),
    newRecords: t("stats.newRecords"),
  };

  return (
    <div>
      <PageHeader
        title={t("greeting", { name: session.name })}
        subtitle={t("subtitle")}
      />

      <div className="space-y-5">
        <PendingBanner count={summary.pendingCount} />

        <StatsGrid
          stats={summary.stats}
          labels={labels}
          locale={locale}
          trendLabel={t("trendAria")}
        />

        <div className="grid gap-5 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <VisitsChart week={week.points} fourWeeks={fourWeeks.points} />
          </div>
          <TodayAppointments
            items={summary.todayAppointments}
            locale={locale}
          />
        </div>

        <RecentPatients patients={summary.recentPatients} locale={locale} />

        {summary.demoMode ? (
          <p className="flex items-center justify-center gap-2 text-center text-[11px] text-muted">
            <FiInfo aria-hidden="true" className="size-3.5" />
            {t("demoFooter")}
          </p>
        ) : null}
      </div>
    </div>
  );
}
