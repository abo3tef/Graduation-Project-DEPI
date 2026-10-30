"use client";

import { useActionState, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { updatePatientAction } from "@/data/patients/actions";
import { useRolePreview } from "@/features/shell/role-context";
import { Modal } from "@/components/ui/modal";
import { PatientFormFields } from "@/features/patients/PatientFormFields";
import type { ActionState } from "@/types/actions";
import type { PatientDetail } from "@/types/api";

const INITIAL: ActionState = {};

export function EditPatientButton({ patient }: { patient: PatientDetail }) {
  const t = useTranslations("patients");
  const common = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const { canManage, role } = useRolePreview();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (previous: ActionState, formData: FormData): Promise<ActionState> => {
      const result = await updatePatientAction(previous, formData);
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
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-bold text-foreground transition hover:border-primary/40 hover:text-primary"
      >
        <FiEdit2 aria-hidden="true" className="size-4" />
        {t("edit")}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("form.editTitle")}
        description={t("form.editDescription")}
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
              form="edit-patient-form"
              disabled={pending}
              className="inline-flex h-10 items-center rounded-xl bg-primary px-4 text-sm font-bold text-[#04211e] transition hover:bg-primary/90 disabled:opacity-70"
            >
              {pending ? t("form.saving") : t("form.saveChanges")}
            </button>
          </div>
        }
      >
        <form id="edit-patient-form" action={formAction} className="space-y-4">
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="patientId" value={patient.id} />
          <PatientFormFields
            idPrefix="edit-patient"
            state={state}
            values={{
              name: patient.name,
              phone: patient.phone ?? "",
              birthDate: patient.birthDate,
              gender: patient.gender,
              address: patient.address ?? "",
              emergencyContact: patient.emergencyContact ?? "",
              notes: patient.notes ?? "",
            }}
            showNotes={role !== "secretary"}
          />
        </form>
      </Modal>
    </>
  );
}
