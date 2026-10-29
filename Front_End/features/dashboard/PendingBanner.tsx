"use client";

import { useEffect, useState } from "react";
import { FiCalendar, FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";

const STORAGE_KEY = "medilog.dismissed-pending-banner";

export function PendingBanner({ count }: { count: number }) {
  const t = useTranslations();
  const [visible, setVisible] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
    if (window.sessionStorage.getItem(STORAGE_KEY) === "1") {
      setVisible(false);
    }
  }, []);

  if (count <= 0 || !visible) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 ${
        ready ? "" : "opacity-0"
      }`}
      role="status"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-warning/15 text-warning">
        <FiCalendar aria-hidden="true" className="size-4" />
      </span>
      <p className="min-w-0 flex-1 text-sm leading-6 text-foreground">
        {t("dashboard.pendingBanner", { count })}
      </p>
      <button
        type="button"
        aria-label={t("common.dismiss")}
        onClick={() => {
          window.sessionStorage.setItem(STORAGE_KEY, "1");
          setVisible(false);
        }}
        className="grid size-8 shrink-0 place-items-center rounded-lg text-muted transition hover:bg-white/5 hover:text-foreground"
      >
        <FiX aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
