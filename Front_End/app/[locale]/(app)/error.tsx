"use client";

import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function AppError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors");

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-danger/10 text-danger">
          <FiAlertTriangle aria-hidden="true" className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold">{t("title")}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          {t("description")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-[#04211e] transition hover:bg-primary/90"
          >
            <FiRefreshCw aria-hidden="true" className="size-4" />
            {t("retry")}
          </button>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center rounded-xl border border-border px-4 text-sm font-semibold text-muted transition hover:text-foreground"
          >
            {t("backDashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}
