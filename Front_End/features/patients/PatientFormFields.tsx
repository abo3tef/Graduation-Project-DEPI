"use client";

import { useTranslations } from "next-intl";
import { Field, inputClass, selectClass, textareaClass } from "@/components/ui/form";
import { clinicToday } from "@/lib/clinic-dates";
import { normalizeDigits } from "@/lib/utils";
import type { ActionState } from "@/types/actions";
import type { Gender } from "@/types/api";
import type { AssignedDoctor } from "@/types/secretary";

export interface PatientFormValues {
  name: string;
  phone: string;
  birthDate: string;
  gender: Gender | "";
  address: string;
  emergencyContact: string;
  notes: string;
}

export const EMPTY_PATIENT_VALUES: PatientFormValues = {
  name: "",
  phone: "",
  birthDate: "",
  gender: "",
  address: "",
  emergencyContact: "",
  notes: "",
};

/**
 * The fields shared by the create and edit forms. Inputs are uncontrolled: the parent modal
 * unmounts its form when closed, so every opening starts from `values`.
 *
 * `showNotes` is false for secretaries (clinical notes are not basic patient information).
 * `doctors` is only passed when a doctor must be chosen, i.e. a secretary with several doctors.
 */
export function PatientFormFields({
  idPrefix,
  state,
  values,
  showNotes,
  doctors = [],
}: {
  idPrefix: string;
  state: ActionState;
  values: PatientFormValues;
  showNotes: boolean;
  doctors?: AssignedDoctor[];
}) {
  const t = useTranslations("patients");
  const common = useTranslations("common");
  const error = (field: string) =>
    state.fieldErrors?.[field] ? t(state.fieldErrors[field]) : undefined;

  return (
    <>
      <Field label={t("form.name")} htmlFor={`${idPrefix}-name`} error={error("name")}>
        <input
          id={`${idPrefix}-name`}
          name="name"
          required
          minLength={2}
          maxLength={200}
          defaultValue={values.name}
          placeholder={t("form.namePlaceholder")}
          className={inputClass}
        />
      </Field>

      <Field label={t("form.phone")} htmlFor={`${idPrefix}-phone`} error={error("phone")}>
        <input
          id={`${idPrefix}-phone`}
          name="phone"
          required
          inputMode="numeric"
          autoComplete="tel"
          defaultValue={values.phone}
          onInput={(event) => {
            event.currentTarget.value = normalizeDigits(event.currentTarget.value);
          }}
          placeholder={t("form.phonePlaceholder")}
          dir="ltr"
          className={`${inputClass} text-start`}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t("form.birthDate")}
          htmlFor={`${idPrefix}-birth-date`}
          error={error("birthDate")}
        >
          <input
            id={`${idPrefix}-birth-date`}
            name="birthDate"
            type="date"
            required
            max={clinicToday()}
            defaultValue={values.birthDate}
            className={inputClass}
          />
        </Field>

        <Field
          label={t("form.gender")}
          htmlFor={`${idPrefix}-gender`}
          error={error("gender")}
        >
          <select
            id={`${idPrefix}-gender`}
            name="gender"
            required
            defaultValue={values.gender}
            className={selectClass}
          >
            <option value="" disabled>
              {t("form.genderPlaceholder")}
            </option>
            <option value="female">{t("gender.female")}</option>
            <option value="male">{t("gender.male")}</option>
            <option value="unspecified">{t("gender.unspecified")}</option>
          </select>
        </Field>
      </div>

      <Field
        label={t("form.address")}
        htmlFor={`${idPrefix}-address`}
        hint={common("optional")}
        error={error("address")}
      >
        <input
          id={`${idPrefix}-address`}
          name="address"
          maxLength={500}
          autoComplete="street-address"
          defaultValue={values.address}
          placeholder={t("form.addressPlaceholder")}
          className={inputClass}
        />
      </Field>

      <Field
        label={t("form.emergencyContact")}
        htmlFor={`${idPrefix}-emergency-contact`}
        hint={common("optional")}
        error={error("emergencyContact")}
      >
        <input
          id={`${idPrefix}-emergency-contact`}
          name="emergencyContact"
          maxLength={300}
          defaultValue={values.emergencyContact}
          placeholder={t("form.emergencyContactPlaceholder")}
          className={inputClass}
        />
      </Field>

      {doctors.length > 1 ? (
        <Field
          label={t("form.doctor")}
          htmlFor={`${idPrefix}-doctor`}
          error={error("doctorId")}
        >
          <select
            id={`${idPrefix}-doctor`}
            name="doctorId"
            required
            defaultValue=""
            className={selectClass}
          >
            <option value="" disabled>
              {t("form.doctorPlaceholder")}
            </option>
            {doctors.map((doctor) => (
              <option key={doctor.doctorId} value={doctor.doctorId}>
                {doctor.specialization
                  ? `${doctor.fullName} — ${doctor.specialization}`
                  : doctor.fullName}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {showNotes ? (
        <Field
          label={t("form.notes")}
          htmlFor={`${idPrefix}-notes`}
          hint={common("optional")}
          error={error("notes")}
        >
          <textarea
            id={`${idPrefix}-notes`}
            name="notes"
            maxLength={2000}
            defaultValue={values.notes}
            placeholder={t("form.notesPlaceholder")}
            className={textareaClass}
          />
        </Field>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger"
        >
          {t(state.error)}
        </p>
      ) : null}
    </>
  );
}
