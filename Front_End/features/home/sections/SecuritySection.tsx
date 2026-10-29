"use client";
import { FiKey, FiLock, FiShield, FiUsers } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Reveal, SectionHeading } from "../components/Reveal";
const items = [
  ["permissions", FiUsers],
  ["isolation", FiShield],
  ["passwords", FiKey],
  ["https", FiLock],
] as const;
export default function SecuritySection() {
  const t = useTranslations("home");
  return (
    <section
      className="rounded-[28px] bg-[radial-gradient(ellipse_at_94%_75%,rgb(17_153_145_/_17%),transparent_25%),#070e1a] px-4 py-16 sm:py-20"
      id="security"
    >
      <div className="mx-auto w-full max-w-[940px]">
        <SectionHeading
          title={t("securityTitle")}
          description={t("securityDescription")}
        />
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {items.map(([key, Icon], index) => (
            <Reveal
              className="min-h-[125px] rounded-[17px] border border-[#1d2b42] bg-transparent p-4"
              delay={index * 0.06}
              key={key}
            >
              <span className="grid h-[34px] w-[34px] place-items-center rounded-[11px] bg-[#0d302f] text-base text-[#2dd4bf]">
                <Icon />
              </span>
              <h3 className="mb-1 mt-3 text-sm font-bold text-[#eaf0fa]">
                {t(`security.${key}.title`)}
              </h3>
              <p className="text-xs leading-6 text-[#9aa8bd]">
                {t(`security.${key}.description`)}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
