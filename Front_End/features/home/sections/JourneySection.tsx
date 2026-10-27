"use client";
import { FiActivity, FiCalendar, FiClock, FiFileText } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Reveal, SectionHeading } from "../components/Reveal";
const steps = ["appointment", "visit", "diagnosis", "followup"] as const;
const icons = [FiCalendar, FiActivity, FiFileText, FiClock];
export default function JourneySection() {
  const t = useTranslations("home");
  return (
    <section className="px-4 py-16 sm:py-20" id="journey">
      <div className="mx-auto w-full max-w-[940px]">
        <SectionHeading
          title={t("journeyTitle")}
          description={t("journeyDescription")}
        />
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {steps.map((key, index) => {
            const Icon = icons[index];
            return (
              <Reveal
                className="relative min-h-[145px] rounded-[17px] border border-[#1d2b42] bg-[#111c30] p-4"
                delay={index * 0.08}
                key={key}
              >
                <span className="absolute left-3 top-3 grid h-[18px] w-[18px] place-items-center rounded-full bg-[#eaf0fa] text-[10px] font-extrabold text-[#0a1220]">
                  {index + 1}
                </span>
                <span className="grid h-[34px] w-[34px] place-items-center rounded-[11px] bg-[#0d302f] text-base text-[#2dd4bf]">
                  <Icon />
                </span>
                <h3 className="mb-1 mt-3 text-sm font-bold text-[#eaf0fa]">
                  {t(`journey.${key}.title`)}
                </h3>
                <p className="text-xs leading-6 text-[#9aa8bd]">
                  {t(`journey.${key}.description`)}
                </p>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
