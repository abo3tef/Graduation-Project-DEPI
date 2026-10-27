"use client";

import { useLocale, useTranslations } from "next-intl";
import { FiGlobe } from "react-icons/fi";
import { usePathname, Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const t = useTranslations("language");
  const nextLocale: Locale = locale === "ar" ? "en" : "ar";

  return (
    <Link
      className="language-switcher"
      href={pathname}
      locale={nextLocale}
      aria-label={t("ariaLabel")}
    >
      <FiGlobe aria-hidden="true" />
      {t("switchTo")}
    </Link>
  );
}
