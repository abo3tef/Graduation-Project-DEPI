"use client";

import { FiCalendar, FiChevronLeft, FiGrid, FiLogOut, FiUsers } from "react-icons/fi";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/data/auth/actions";
import { useRolePreview } from "@/features/shell/role-context";
import type { UserRole } from "@/constants/roles";

const NAV_ITEMS = [
  { key: "dashboard", href: "/dashboard", icon: FiGrid },
  { key: "patients", href: "/patients", icon: FiUsers },
  { key: "appointments", href: "/appointments", icon: FiCalendar },
] as const;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  name: string;
}

function roleLabel(t: (key: string) => string, role: UserRole): string {
  return t(`roles.${role}`);
}

export function Sidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapsed,
  name,
}: SidebarProps) {
  const t = useTranslations("shell");
  const locale = useLocale();
  const pathname = usePathname();
  const { role } = useRolePreview();
  const compact = collapsed && !open;
  const labelClass = open ? "inline" : collapsed ? "hidden xl:inline" : "inline";

  return (
    <aside
      className={cn(
        "app-sidebar fixed inset-y-0 start-0 z-50 flex flex-col border-e border-border bg-surface",
        "transition-[width,transform] duration-200 ease-out",
        open ? "w-72" : collapsed ? "w-20 xl:w-64" : "w-64",
        open && "is-open",
      )}
      aria-label={t("nav.label")}
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2 border-b border-border",
          compact ? "justify-center px-2 xl:justify-start xl:px-5" : "px-5",
        )}
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
          <MdOutlineHealthAndSafety aria-hidden="true" className="size-5" />
        </span>
        <span className={cn("truncate text-sm font-extrabold", labelClass)}>
          {t("brand")}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ms-auto grid size-8 place-items-center rounded-lg text-muted hover:bg-white/5 hover:text-foreground md:hidden"
          aria-label={t("topbar.closeMenu")}
        >
          <FiChevronLeft aria-hidden="true" className="size-4 rtl:-scale-x-100" />
        </button>
      </div>

      <nav className={cn("flex-1 space-y-1 py-4", compact ? "px-2" : "px-3")}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const label = t(`nav.${item.key}`);

          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={onClose}
              title={compact ? label : undefined}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
                compact
                  ? "justify-center xl:justify-start"
                  : "justify-start",
                active
                  ? "bg-primary/12 text-primary"
                  : "text-muted hover:bg-white/5 hover:text-foreground",
              )}
            >
              <Icon aria-hidden="true" className="size-[18px] shrink-0" />
              <span className={cn("truncate", labelClass)}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={cn("border-t border-border py-3", compact ? "px-2" : "px-3")}>
        <div
          className={cn(
            "mb-2 flex items-center gap-3 rounded-xl bg-surface-2/70 px-2 py-2",
            compact && "justify-center xl:justify-start",
          )}
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
            {name.slice(0, 1)}
          </span>
          <span className={cn("min-w-0", labelClass)}>
            <span className="block truncate text-xs font-bold">{name}</span>
            <span className="block truncate text-[11px] text-muted">
              {roleLabel(t, role)}
            </span>
          </span>
        </div>

        <form action={logoutAction}>
          <input type="hidden" name="locale" value={locale} />
          <button
            type="submit"
            title={compact ? t("nav.logout") : undefined}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-muted transition hover:bg-danger/10 hover:text-danger",
              compact ? "justify-center xl:justify-start" : "justify-start",
            )}
          >
            <FiLogOut aria-hidden="true" className="size-[18px] shrink-0" />
            <span className={labelClass}>{t("nav.logout")}</span>
          </button>
        </form>

        <button
          type="button"
          onClick={onToggleCollapsed}
          className="mt-2 hidden w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-muted transition hover:bg-white/5 hover:text-foreground md:flex xl:hidden"
          aria-label={
            collapsed ? t("topbar.expandSidebar") : t("topbar.collapseSidebar")
          }
        >
          <FiChevronLeft
            aria-hidden="true"
            className={cn(
              "size-4 transition-transform",
              collapsed ? "rotate-180 rtl:rotate-0" : "rotate-0 rtl:rotate-180",
            )}
          />
          <span className={labelClass}>
            {collapsed
              ? t("topbar.expandSidebar")
              : t("topbar.collapseSidebar")}
          </span>
        </button>
      </div>
    </aside>
  );
}
