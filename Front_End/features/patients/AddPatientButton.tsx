"use client";

import { useActionState, useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createPatientAction } from "@/data/patients/actions";
import { useRolePreview } from "@/features/shell/role-context";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass, selectClass, textareaClass } from "@/components/ui/form";
import { clinicToday } from "@/lib/clinic-dates";
import { normalizeDigits } from "@/lib/utils";
import type { ActionState } from "@/types/actions";

const INITIAL: ActionState = {};

export function AddPatientButton() {
  const t = useTranslations("patients");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { canManage } = useRolePreview();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createPatientAction,
    INITIAL,
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (state.success) {
      setOpen(false);
      setName("");
      setPhone("");
      setBirthDate("");
      setGender("");
      setNotes("");
      router.refresh();
    }
  }, [state.success, router]);

  if (!canManage) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-[#04211e] transition hover:bg-primary/90"
      >
        <FiPlus aria-hidden="true" className="size-4" />
        {t("add")}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("form.title")}
        description={t("form.description")}
        footer={
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold text-muted transition hover:text-foreground"
            >
              {common("cancel")}
            </button>
            <button
              type="submit"
              form="add-patient-form"
              disabled={pending}
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-bold text-[#04211e] transition hover:bg-primary/90 disabled:opacity-70"
            >
              {pending ? t("form.saving") : t("form.submit")}
            </button>
          </div>
        }
      >
        <form id="add-patient-form" action={formAction} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="gender" value={gender} />

          <Field
            label={t("form.name")}
            htmlFor="patient-name"
            error={
              state.fieldErrors?.name ? t(state.fieldErrors.name) : undefined
            }
          >
            <input
              id="patient-name"
              name="name"
              required
              minLength={2}
              maxLength={200}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("form.namePlaceholder")}
              className={inputClass}
            />
          </Field>

          <Field
            label={t("form.phone")}
            htmlFor="patient-phone"
            error={
              state.fieldErrors?.phone ? t(state.fieldErrors.phone) : undefined
            }
          >
            <input
              id="patient-phone"
              name="phone"
              required
              inputMode="numeric"
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(normalizeDigits(event.target.value))}
              placeholder={t("form.phonePlaceholder")}
              dir="ltr"
              className={`${inputClass} text-start`}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={t("form.birthDate")}
              htmlFor="patient-birth-date"
              error={
                state.fieldErrors?.birthDate
                  ? t(state.fieldErrors.birthDate)
                  : undefined
              }
            >
              <input
                id="patient-birth-date"
                name="birthDate"
                type="date"
                required
                max={clinicToday()}
                value={birthDate}
                onChange={(event) => setBirthDate(event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field
              label={t("form.gender")}
              htmlFor="patient-gender"
              error={
                state.fieldErrors?.gender
                  ? t(state.fieldErrors.gender)
                  : undefined
              }
            >
              <select
                id="patient-gender"
                required
                value={gender}
                onChange={(event) => setGender(event.target.value)}
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
            label={t("form.notes")}
            htmlFor="patient-notes"
            hint={common("optional")}
            error={
              state.fieldErrors?.notes ? t(state.fieldErrors.notes) : undefined
            }
          >
            <textarea
              id="patient-notes"
              name="notes"
              maxLength={2000}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("form.notesPlaceholder")}
              className={textareaClass}
            />
          </Field>

          {state.error ? (
            <p
              role="alert"
              className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-semibold text-danger"
            >
              {t(state.error)}
            </p>
          ) : null}
        </form>
      </Modal>
    </>
  );
}
