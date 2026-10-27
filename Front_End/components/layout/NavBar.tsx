"use client";

import { FiArrowLeft, FiArrowRight, FiLogIn, FiMenu } from "react-icons/fi";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/language-switcher";

function NavBar() {
  const locale = useLocale();
  const t = useTranslations("navigation");
  const isArabic = locale === "ar";
  const DirectionIcon = isArabic ? FiArrowLeft : FiArrowRight;
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="container navbar">
        <Link className="brand" href="/" aria-label={t("brand")}>
          <MdOutlineHealthAndSafety className="text-[var(--color-primary)] size-5" />
          <span>{t("brand")}</span>
        </Link>

        <nav className="desktop-nav" aria-label={t("ariaLabel")}>
          <Link href="/">{t("home")}</Link>
          <Link href="/#features">{t("features")}</Link>
          <Link href="/#search">{t("search")}</Link>
          <Link href="/#security">{t("security")}</Link>
        </nav>

        <div className="navbar-actions">
          <LanguageSwitcher />
          <Link className="login-button" href="/login">
            <FiLogIn aria-hidden="true" />
            <span>{t("login")}</span>
            <DirectionIcon aria-hidden="true" />
          </Link>
          <button
            className="mobile-menu-button"
            type="button"
            aria-label={t("menu")}
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            <FiMenu aria-hidden="true" />
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <nav className="mobile-nav container" aria-label={t("ariaLabel")}>
          <Link href="/" onClick={() => setIsMenuOpen(false)}>
            {t("home")}
          </Link>
          <Link href="/#features" onClick={() => setIsMenuOpen(false)}>
            {t("features")}
          </Link>
          <Link href="/#search" onClick={() => setIsMenuOpen(false)}>
            {t("search")}
          </Link>
          <Link href="/#security" onClick={() => setIsMenuOpen(false)}>
            {t("security")}
          </Link>
          <LanguageSwitcher />
        </nav>
      )}
    </header>
  );
}

export default NavBar;
