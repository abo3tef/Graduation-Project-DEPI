import { apiRequest } from "@/data/api/client";
import { requireSession } from "@/data/auth/session";
import type { Locale } from "@/i18n/routing";
import type {
  DashboardSummary,
  VisitsRange,
  VisitsResponse,
} from "@/types/api";

export async function getDashboardSummary(
  locale: Locale,
): Promise<DashboardSummary> {
  const session = await requireSession(locale);
  return apiRequest<DashboardSummary>("/api/v1/dashboard/summary", {
    locale,
    token: session.token,
  });
}

export async function getVisits(
  locale: Locale,
  range: VisitsRange,
): Promise<VisitsResponse> {
  const session = await requireSession(locale);
  return apiRequest<VisitsResponse>("/api/v1/dashboard/visits", {
    locale,
    token: session.token,
    query: { range },
  });
}
