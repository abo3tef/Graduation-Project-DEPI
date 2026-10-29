"use client";

import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { SECRETARY_NAV_ITEMS } from "../navigation";

export function SecretaryNav() {
  const t = useTranslations("secretary.navigation");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="flex flex-wrap gap-2 border-b border-border pb-3"
    >
      {SECRETARY_NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.key}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              isActive
                ? "bg-primary text-white"
                : "text-muted hover:bg-tint hover:text-foreground"
            }`}
          >
            {t(item.key)}
          </Link>
        );
      })}
    </nav>
  );
}
