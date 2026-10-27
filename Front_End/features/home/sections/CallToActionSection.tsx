"use client";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Reveal } from "../components/Reveal";
export default function CallToActionSection() {
  const t = useTranslations("home");
  return (
    <section className="px-4 pb-16 pt-8 sm:pb-20">
      <Reveal className="mx-auto grid min-h-[150px] w-full max-w-[940px] content-center justify-items-center gap-3 rounded-[22px] bg-[linear-gradient(115deg,#25c4b3,#0c263c)] p-6 text-center">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          {t("ctaTitle")}
        </h2>
        <div className="flex flex-wrap justify-center gap-2">
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-[#f7fafc] px-4 py-2 text-xs font-bold text-[#0a1220] transition-transform hover:-translate-y-0.5"
            href="/register"
          >
            {t("createAccount")}
          </Link>
          <Link
            className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#d9e9ef] px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
            href="/login"
          >
            {t("login")}
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
