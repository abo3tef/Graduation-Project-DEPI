"use client";

import { useActionState, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createPatientAction } from "@/data/patients/actions";
import { useRolePreview } from "@/features/shell/role-context";
import { Modal } from "@/components/ui/modal";
import {
  EMPTY_PATIENT_VALUES,
  PatientFormFields,
} from "@/features/patients/PatientFormFields";
import type { ActionState } from "@/types/actions";
import type { AssignedDoctor } from "@/types/secretary";

const INITIAL: ActionState = {};

/**
 * `doctors` lists the doctors a secretary can register patients for. The form only asks for one
 * when there are several; otherwise the API assigns the patient to the single available doctor.
 */
export function AddPatientButton({ doctors = [] }: { doctors?: AssignedDoctor[] }) {
  const t = useTranslations("patients");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { canManage, role } = useRolePreview();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previous: ActionState, formData: FormData): Promise<ActionState> => {
      const result = await createPatientAction(previous, formData);
      if (result.success) {
        setOpen(false);
        router.refresh();
      }
      return result;
    },
    INITIAL,
  );

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
          <PatientFormFields
            idPrefix="add-patient"
            state={state}
            values={EMPTY_PATIENT_VALUES}
            showNotes={role !== "secretary"}
            doctors={doctors}
          />
        </form>
      </Modal>
    </>
  );
}
