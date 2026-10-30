import { apiRequest } from "@/data/api/client";
import { requireSession } from "@/data/auth/session";
import type { Locale } from "@/i18n/routing";
import type { AssignedDoctor, SecretaryAccount } from "@/types/secretary";
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
      gender: params.gender,
      minAge: params.minAge,
      maxAge: params.maxAge,
    },
  });
}

/**
 * The doctors a secretary may register patients for. Doctors and other roles get an empty list:
 * a doctor always owns their own patients, so there is nothing to choose.
 */
export async function getAssignedDoctors(locale: Locale): Promise<AssignedDoctor[]> {
  const session = await requireSession(locale);
  if (session.role !== "secretary") {
    return [];
  }

  try {
    const account = await apiRequest<SecretaryAccount>("/api/secretary/me", {
      locale,
      token: session.token,
    });
    return account.assignedDoctors;
  } catch {
    return [];
  }
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
