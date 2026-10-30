"use server";

import { revalidatePath } from "next/cache";
import { getLocale } from "next-intl/server";
import { ApiError, apiRequest } from "@/data/api/client";
import {
  ActionSessionError,
  requireActionSession,
} from "@/data/api/context";
import { toLocale } from "@/lib/locale";
import { normalizeDigits } from "@/lib/utils";
import type { ActionState } from "@/types/actions";
import type { PatientDetail } from "@/types/api";

const PATIENT_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function mapPatientError(error: ApiError): ActionState {
  if (error.code === "duplicate_phone") {
    return {
      error: "patients.form.errors.duplicatePhone",
      fieldErrors: { phone: "patients.form.errors.duplicatePhone" },
    };
  }

  if (error.code === "network_error") {
    return { error: "errors.network" };
  }

  if (error.code === "patient_not_found") {
    return { error: "patients.form.errors.notFound" };
  }

  if (
    error.code === "doctor_not_allowed" ||
    error.code === "no_assigned_doctor"
  ) {
    return {
      error: "patients.form.errors.doctorNotAllowed",
      fieldErrors: { doctorId: "patients.form.errors.doctorNotAllowed" },
    };
  }

  const fieldErrors: Record<string, string> = {};
  for (const code of Object.values(error.fieldCodes).flat()) {
    if (code.startsWith("name_")) {
      fieldErrors.name = "patients.form.errors.name";
    } else if (code.startsWith("phone_") || code === "duplicate_phone") {
      fieldErrors.phone = "patients.form.errors.phone";
    } else if (code.startsWith("birth_date_")) {
      fieldErrors.birthDate =
        code === "birth_date_future"
          ? "patients.form.errors.birthDateFuture"
          : "patients.form.errors.birthDate";
    } else if (code.startsWith("gender_")) {
      fieldErrors.gender = "patients.form.errors.gender";
    } else if (code.startsWith("notes_")) {
      fieldErrors.notes = "patients.form.errors.notes";
    } else if (code.startsWith("address_")) {
      fieldErrors.address = "patients.form.errors.address";
    } else if (code.startsWith("emergency_contact_")) {
      fieldErrors.emergencyContact = "patients.form.errors.emergencyContact";
    } else if (code === "doctor_required") {
      fieldErrors.doctorId = "patients.form.errors.doctorRequired";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      error: "patients.form.errors.generic",
      fieldErrors,
    };
  }

  return { error: "patients.form.errors.generic" };
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function readPatientFields(formData: FormData) {
  return {
    name: text(formData, "name"),
    phone: normalizeDigits(text(formData, "phone")).trim(),
    birthDate: text(formData, "birthDate"),
    gender: text(formData, "gender") || "unspecified",
    notes: text(formData, "notes") || null,
    address: text(formData, "address") || null,
    emergencyContact: text(formData, "emergencyContact") || null,
  };
}

function missingRequired(
  payload: ReturnType<typeof readPatientFields>,
): ActionState | null {
  if (payload.name && payload.phone && payload.birthDate) {
    return null;
  }

  return {
    error: "patients.form.errors.required",
    fieldErrors: {
      ...(payload.name ? {} : { name: "patients.form.errors.name" }),
      ...(payload.phone ? {} : { phone: "patients.form.errors.phone" }),
      ...(payload.birthDate
        ? {}
        : { birthDate: "patients.form.errors.birthDate" }),
    },
  };
}

export async function createPatientAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = toLocale(formData.get("locale") ?? (await getLocale()));

  let session;
  try {
    session = await requireActionSession();
  } catch (error) {
    if (error instanceof ActionSessionError) {
      return { error: "errors.sessionExpired" };
    }
    throw error;
  }

  const payload = {
    ...readPatientFields(formData),
    doctorId: text(formData, "doctorId") || null,
  };

  const missing = missingRequired(payload);
  if (missing) {
    return missing;
  }

  try {
    await apiRequest<PatientDetail>("/api/v1/patients", {
      method: "POST",
      locale,
      token: session.token,
      body: payload,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return mapPatientError(error);
    }
    return { error: "patients.form.errors.generic" };
  }

  revalidatePath(`/${locale}/patients`);
  revalidatePath(`/${locale}/dashboard`);
  return { success: true };
}

export async function updatePatientAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const locale = toLocale(formData.get("locale") ?? (await getLocale()));

  let session;
  try {
    session = await requireActionSession();
  } catch (error) {
    if (error instanceof ActionSessionError) {
      return { error: "errors.sessionExpired" };
    }
    throw error;
  }

  const patientId = text(formData, "patientId");
  if (!PATIENT_ID.test(patientId)) {
    return { error: "patients.form.errors.notFound" };
  }

  const payload = readPatientFields(formData);
  const missing = missingRequired(payload);
  if (missing) {
    return missing;
  }

  try {
    await apiRequest<PatientDetail>(`/api/v1/patients/${patientId}`, {
      method: "PATCH",
      locale,
      token: session.token,
      body: payload,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return mapPatientError(error);
    }
    return { error: "patients.form.errors.generic" };
  }

  revalidatePath(`/${locale}/patients`);
  revalidatePath(`/${locale}/patients/${patientId}`);
  return { success: true };
}
