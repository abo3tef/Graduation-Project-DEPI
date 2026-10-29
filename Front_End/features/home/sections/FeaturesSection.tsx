"use client";
import {
  FiActivity,
  FiAlertTriangle,
  FiCalendar,
  FiClock,
  FiFileText,
  FiKey,
  FiLink,
  FiLock,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Reveal, SectionHeading } from "../components/Reveal";
const items = [
  ["visits", FiActivity],
  ["diagnoses", FiFileText],
  ["medications", FiLink],
  ["allergies", FiAlertTriangle],
  ["vitals", FiActivity],
  ["timeline", FiClock],
  ["documents", FiFileText],
  ["appointments", FiCalendar],
] as const;
export default function FeaturesSection() {
  const t = useTranslations("home");
  return (
    <section className="px-4 py-16 sm:py-20" id="features">
      <div className="mx-auto w-full max-w-[940px]">
        <SectionHeading
          title={t("featuresTitle")}
          description={t("featuresDescription")}
        />
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {items.map(([key, Icon], index) => (
            <Reveal
              className="min-h-[140px] rounded-[17px] border border-[#1d2b42] bg-[#111c30] p-4"
              delay={(index % 4) * 0.04}
              key={key}
            >
              <span className="grid h-[34px] w-[34px] place-items-center rounded-[11px] bg-[#0d302f] text-base text-[#2dd4bf]">
                <Icon />
              </span>
              <h3 className="mb-1 mt-3 text-sm font-bold text-[#eaf0fa]">
                {t(`feature.${key}.title`)}
              </h3>
              <p className="text-xs leading-6 text-[#9aa8bd]">
                {t(`feature.${key}.description`)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
