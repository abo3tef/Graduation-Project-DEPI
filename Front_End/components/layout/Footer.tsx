import { FiArrowUpRight } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { MdOutlineHealthAndSafety } from "react-icons/md";

function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="site-footer">
      <div className="container footer-card">
        <div className="footer-grid">
          <div className="footer-intro">
            <Link className="brand footer-brand" href="/">
              <MdOutlineHealthAndSafety className="text-[var(--color-primary)] size-5" />
              <span>{t("brand")}</span>
            </Link>
            <p>{t("description")}</p>
            <Link className="footer-link footer-cta" href="/#about">
              {t("learnMore")}
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>

          <div className="footer-column">
            <h2>{t("platform.title")}</h2>
            <Link href="/#patients">{t("platform.patients")}</Link>
            <Link href="/#appointments">{t("platform.appointments")}</Link>
            <Link href="/#records">{t("platform.records")}</Link>
          </div>

          <div className="footer-column">
            <h2>{t("account.title")}</h2>
            <Link href="/login">{t("account.login")}</Link>
            <Link href="/register">{t("account.register")}</Link>
            <Link href="/forgot-password">{t("account.forgotPassword")}</Link>
          </div>

          <div className="footer-column">
            <h2>{t("security.title")}</h2>
            <Link href="/#permissions">{t("security.permissions")}</Link>
            <Link href="/#privacy">{t("security.privacy")}</Link>
            <Link href="/#contact">{t("security.contact")}</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>{t("copyright")}</span>
          <span>{t("tagline")}</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
