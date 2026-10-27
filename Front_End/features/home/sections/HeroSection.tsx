"use client";
import { FiActivity, FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroIllustration } from "../components/Illustrations";

export default function HeroSection() {
  const t = useTranslations("home");
  const isArabic = useLocale() === "ar";
  const Arrow = isArabic ? FiArrowLeft : FiArrowRight;
  return (
    <section
      id="about"
      className="relative overflow-hidden rounded-b-[28px] bg-[radial-gradient(ellipse_at_12%_28%,rgb(17_153_145_/_22%),transparent_28%),#070e1a]"
    >
      <div className="mx-auto grid min-h-[380px] w-[min(100%_-_2rem,940px)] grid-cols-1 items-center gap-4 py-12 md:grid-cols-2 md:gap-12 md:py-14">
        <div className="order-2 text-center md:order-2 md:text-start">
          <span className="inline-flex items-center gap-2 text-xs font-bold text-[#2dd4bf]">
            <FiActivity />
            {t("eyebrow")}
          </span>
          <h1 className="mx-auto mb-3 mt-2 max-w-[13ch] text-4xl font-extrabold leading-tight tracking-tight text-[#eaf0fa] sm:text-5xl md:mx-0">
            {t("heroTitle")}
            <span className="block text-[#2dd4bf]">{t("heroHighlight")}</span>
          </h1>
          <p className="mx-auto mb-5 mt-5 max-w-[43ch] text-sm leading-7 text-[#9aa8bd] md:mx-0">
            {t("heroDescription")}
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 md:justify-start">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#2dd4bf] px-4 py-2 text-sm font-bold text-[#07101e] transition-transform hover:-translate-y-0.5"
              href="/register"
            >
              {t("createAccount")}
              <Arrow />
            </Link>
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-slate-500 px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              href="#features"
            >
              {t("watchDemo")}
              <FiArrowRight />
            </a>
          </div>
          <small className="mt-3 block text-xs text-slate-500">
            {t("prototypeNote")}
          </small>
        </div>
        <div className="order-1 md:order-1">
          <HeroIllustration />
        </div>
      </div>
    </section>
  );
}
