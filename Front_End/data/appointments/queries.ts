import { apiRequest } from "@/data/api/client";
import { requireSession } from "@/data/auth/session";
import type { Locale } from "@/i18n/routing";
import type { Appointment, AppointmentQuery } from "@/types/api";

export async function getAppointments(
  locale: Locale,
  query: AppointmentQuery,
): Promise<Appointment[]> {
  const session = await requireSession(locale);
  return apiRequest<Appointment[]>("/api/v1/appointments", {
    locale,
    token: session.token,
    query: {
      date: query.date,
      from: query.from,
      to: query.to,
      patientId: query.patientId,
    },
  });
}
