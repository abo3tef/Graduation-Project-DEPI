import { apiRequest } from "@/data/api/client";
import { requireSession } from "@/data/auth/session";
import type { Locale } from "@/i18n/routing";
import type {
  PagedResult,
  PatientDetail,
  PatientListItem,
  PatientSearchParams,
} from "@/types/api";

export async function searchPatients(
  locale: Locale,
  params: PatientSearchParams,
): Promise<PagedResult<PatientListItem>> {
  const session = await requireSession(locale);
  return apiRequest<PagedResult<PatientListItem>>("/api/v1/patients", {
    locale,
    token: session.token,
    query: {
      search: params.search,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10,
      sort: params.sort ?? "lastVisit_desc",
    },
  });
}

export async function getPatient(
  locale: Locale,
  id: string,
): Promise<PatientDetail> {
  const session = await requireSession(locale);
  return apiRequest<PatientDetail>(`/api/v1/patients/${id}`, {
    locale,
    token: session.token,
  });
}
