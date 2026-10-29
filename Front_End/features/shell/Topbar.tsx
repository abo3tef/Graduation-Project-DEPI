"use client";

import { useState } from "react";
import {
  FiBell,
  FiCheck,
  FiChevronDown,
  FiMenu,
  FiRepeat,
} from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useRolePreview } from "@/features/shell/role-context";
import { USER_ROLES } from "@/constants/roles";
import { clinicToday, formatLongDateOnly } from "@/lib/clinic-dates";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

const TITLES: Record<string, string> = {
  dashboard: "dashboard",
  patients: "patients",
  appointments: "appointments",
};

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const { role, demoMode, setRole } = useRolePreview();
  const [roleOpen, setRoleOpen] = useState(false);

  const segment = pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const titleKey = TITLES[segment] ?? "dashboard";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6 xl:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:text-foreground md:hidden"
          aria-label={t("shell.topbar.openMenu")}
        >
          <FiMenu aria-hidden="true" className="size-4" />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-extrabold leading-6">
            {t(`shell.nav.${titleKey}`)}
          </h1>
          <p className="hidden text-[11px] leading-4 text-muted sm:block">
            {formatLongDateOnly(clinicToday(), locale)}
          </p>
        </div>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2">
          {demoMode ? (
            <div className="relative">
              {roleOpen ? (
                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  onClick={() => setRoleOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
              ) : null}

              <button
                type="button"
                onClick={() => setRoleOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={roleOpen}
                className="relative z-50 inline-flex h-9 items-center gap-1.5 rounded-xl border border-border bg-surface px-2.5 text-xs font-semibold text-muted transition hover:border-primary/40 hover:text-foreground"
              >
                <FiRepeat aria-hidden="true" className="size-3.5" />
                <span className="hidden lg:inline">
                  {t("shell.roleSwitcher.label")}
                </span>
                <span className="hidden font-bold text-foreground sm:inline">
                  {t(`roles.${role}`)}
                </span>
                <FiChevronDown aria-hidden="true" className="size-3.5" />
              </button>

              {roleOpen ? (
                <div
                  role="menu"
                  className="absolute end-0 top-11 z-50 w-56 overflow-hidden rounded-xl border border-border bg-surface p-1.5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)]"
                >
                  {USER_ROLES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      role="menuitemradio"
                      aria-checked={option === role}
                      onClick={() => {
                        setRole(option);
                        setRoleOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-xs font-semibold transition",
                        option === role
                          ? "bg-primary/10 text-primary"
                          : "text-muted hover:bg-white/5 hover:text-foreground",
                      )}
                    >
                      <FiCheck
                        aria-hidden="true"
                        className={cn(
                          "size-3.5",
                          option === role ? "opacity-100" : "opacity-0",
                        )}
                      />
                      {t(`roles.${option}`)}
                    </button>
                  ))}
                  <p className="mt-1 border-t border-border px-3 py-2 text-[11px] leading-4 text-muted">
                    {t("shell.topbar.rolePreviewNote")}
                  </p>
                </div>
              ) : null}
            </div>
          ) : (
            <span className="hidden h-9 items-center rounded-xl border border-border bg-surface px-3 text-xs font-bold text-muted sm:inline-flex">
              {t(`roles.${role}`)}
            </span>
          )}

          <div className="hidden h-9 items-center rounded-xl border border-border bg-surface px-2.5 text-xs sm:flex">
            <LanguageSwitcher />
          </div>

          <button
            type="button"
            aria-label={t("shell.topbar.notificationsAria")}
            title={t("shell.topbar.notifications")}
            className="relative grid size-9 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:text-foreground"
          >
            <FiBell aria-hidden="true" className="size-4" />
            <span className="absolute end-2 top-2 size-2 rounded-full bg-danger ring-2 ring-surface" />
            <span className="sr-only">
              {t("shell.topbar.notificationsUnread")}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
