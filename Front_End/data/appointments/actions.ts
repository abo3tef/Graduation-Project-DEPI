"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { ApiError, apiRequest } from "@/data/api/client";
import {
  ActionSessionError,
  requireActionSession,
} from "@/data/api/context";
import { cairoWallTimeToUtc } from "@/lib/clinic-dates";
import { toLocale } from "@/lib/locale";
import { searchPatients } from "@/data/patients/queries";
import { APPOINTMENT_STATUSES } from "@/constants/appointment";
import type { ActionState } from "@/types/actions";
import type { Appointment, PatientOption } from "@/types/api";

function revalidateAppointments(locale: string) {
  revalidatePath(`/${locale}/appointments`);
  revalidatePath(`/${locale}/dashboard`);
}

function mapAppointmentError(error: ApiError): ActionState {
  switch (error.code) {
    case "appointment_conflict":
      return {
        error: "appointments.form.errors.conflict",
        fieldErrors: { time: "appointments.form.errors.conflict" },
      };
    case "appointment_closed":
      return { error: "appointments.form.errors.closed" };
    case "appointment_not_confirmed":
      return { error: "appointments.errors.notConfirmed" };
    case "visit_already_linked":
      return { error: "appointments.errors.visitAlreadyLinked" };
    case "invalid_status_transition":
      return { error: "appointments.errors.status" };
    case "cancellation_reason_required":
      return {
        error: "appointments.cancel.errors.cancellationReason",
        fieldErrors: {
          cancellationReason:
            "appointments.cancel.errors.cancellationReason",
        },
      };
    case "doctor_only":
      return { error: "errors.unauthorized" };
    case "network_error":
      return { error: "errors.network" };
  }

  const fieldErrors: Record<string, string> = {};
  for (const code of Object.values(error.fieldCodes).flat()) {
    if (code === "patient_required") {
      fieldErrors.patientId = "appointments.form.errors.patient";
    } else if (code === "starts_at_required") {
      fieldErrors.time = "appointments.form.errors.time";
    } else if (code === "duration_invalid") {
      fieldErrors.duration = "appointments.form.errors.duration";
    } else if (code === "reason_invalid") {
      fieldErrors.reason = "appointments.form.errors.reason";
    } else if (code === "notes_too_long") {
      fieldErrors.notes = "appointments.form.errors.notes";
    } else if (code === "cancellation_reason_too_long") {
      fieldErrors.cancellationReason =
        "appointments.cancel.errors.cancellationReason";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "appointments.form.errors.generic",
      fieldErrors,
    };
  }

  return { error: "appointments.form.errors.generic" };
}

async function getActionContext(formData: FormData) {
  const locale = toLocale(formData.get("locale") ?? (await getLocale()));
  const session = await requireActionSession();
  return { locale, session };
}

export async function saveAppointmentAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let context;
  try {
    context = await getActionContext(formData);
  } catch (error) {
    if (error instanceof ActionSessionError) {
      return { error: "errors.sessionExpired" };
    }
    throw error;
  }

  const { locale, session } = context;
  const mode = String(formData.get("mode") ?? "create");
  const id = String(formData.get("id") ?? "");
  const patientId = String(formData.get("patientId") ?? "");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const durationMinutes = Number(formData.get("durationMinutes") ?? 30);
  const reason = String(formData.get("reason") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const fieldErrors: Record<string, string> = {};
  if (!patientId) {
    fieldErrors.patientId = "appointments.form.errors.patient";
  }
  if (!date) {
    fieldErrors.date = "appointments.form.errors.date";
  }
  if (!time) {
    fieldErrors.time = "appointments.form.errors.time";
  }
  if (!Number.isFinite(durationMinutes) || durationMinutes < 15) {
    fieldErrors.duration = "appointments.form.errors.duration";
  }
  if (!reason) {
    fieldErrors.reason = "appointments.form.errors.reason";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "appointments.form.errors.generic",
      fieldErrors,
    };
  }

  const startsAt = cairoWallTimeToUtc(date, time);
  if (Number.isNaN(startsAt.getTime())) {
    return {
      error: "appointments.form.errors.date",
      fieldErrors: { date: "appointments.form.errors.date" },
    };
  }

  const payload = {
    patientId,
    startsAt: startsAt.toISOString(),
    durationMinutes,
    reason,
    notes,
  };

  try {
    if (mode === "edit" && id) {
      await apiRequest<Appointment>(`/api/v1/appointments/${id}`, {
        method: "PATCH",
        locale,
        token: session.token,
        body: payload,
      });
    } else {
      await apiRequest<Appointment>("/api/v1/appointments", {
        method: "POST",
        locale,
        token: session.token,
        body: payload,
      });
    }
  } catch (error) {
    if (error instanceof ApiError) {
      return mapAppointmentError(error);
    }
    return { error: "appointments.form.errors.generic" };
  }

  revalidateAppointments(locale);
  return { success: true };
}

export async function changeAppointmentStatusAction(
  formData: FormData,
): Promise<ActionState> {
  let context;
  try {
    context = await getActionContext(formData);
  } catch (error) {
    if (error instanceof ActionSessionError) {
      return { error: "errors.sessionExpired" };
    }
    throw error;
  }

  const { locale, session } = context;
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const cancellationReason =
    String(formData.get("cancellationReason") ?? "").trim() || null;

  if (!id || !(APPOINTMENT_STATUSES as readonly string[]).includes(status)) {
    return { error: "appointments.errors.status" };
  }

  try {
    await apiRequest<Appointment>(`/api/v1/appointments/${id}/status`, {
      method: "PATCH",
      locale,
      token: session.token,
      body: { status, cancellationReason },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return mapAppointmentError(error);
    }
    return { error: "appointments.errors.status" };
  }

  revalidateAppointments(locale);
  return { success: true };
}

export async function deleteAppointmentAction(
  formData: FormData,
): Promise<ActionState> {
  let context;
  try {
    context = await getActionContext(formData);
  } catch (error) {
    if (error instanceof ActionSessionError) {
      return { error: "errors.sessionExpired" };
    }
    throw error;
  }

  const { locale, session } = context;
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return { error: "appointments.errors.status" };
  }

  try {
    await apiRequest<void>(`/api/v1/appointments/${id}`, {
      method: "DELETE",
      locale,
      token: session.token,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return mapAppointmentError(error);
    }
    return { error: "appointments.form.errors.generic" };
  }

  revalidateAppointments(locale);
  return { success: true };
}

export async function linkVisitAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let context;
  try {
    context = await getActionContext(formData);
  } catch (error) {
    if (error instanceof ActionSessionError) {
      return { error: "errors.sessionExpired" };
    }
    throw error;
  }

  const { locale, session } = context;
  const id = String(formData.get("id") ?? "");
  const chiefComplaint =
    String(formData.get("chiefComplaint") ?? "").trim() || null;
  const clinicalNotes =
    String(formData.get("clinicalNotes") ?? "").trim() || null;

  if (!id) {
    return { error: "appointments.visit.errors.generic" };
  }

  try {
    await apiRequest<Appointment>(`/api/v1/appointments/${id}/visit`, {
      method: "POST",
      locale,
      token: session.token,
      body: { chiefComplaint, clinicalNotes },
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return mapAppointmentError(error);
    }
    return { error: "appointments.visit.errors.generic" };
  }

  revalidateAppointments(locale);
  return { success: true };
}

export async function searchPatientsForBookingAction(
  query: string,
): Promise<PatientOption[]> {
  const locale = toLocale(await getLocale());
  const session = await requireActionSession();
  const result = await searchPatients(locale, {
    search: query.trim() || undefined,
    page: 1,
    pageSize: 8,
    sort: "name_asc",
  });

  return result.items.map((item) => ({
    id: item.id,
    code: item.code,
    fullName: item.fullName,
    phone: item.phone,
  }));
}
