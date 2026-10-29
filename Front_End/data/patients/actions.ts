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

  const phone = normalizeDigits(String(formData.get("phone") ?? "")).trim();
  const payload = {
    name: String(formData.get("name") ?? "").trim(),
    phone,
    birthDate: String(formData.get("birthDate") ?? ""),
    gender: String(formData.get("gender") ?? "unspecified"),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };

  if (!payload.name || !payload.phone || !payload.birthDate) {
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
