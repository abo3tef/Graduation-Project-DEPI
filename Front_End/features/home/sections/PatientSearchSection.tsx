"use client";
import { FiCheck, FiSearch, FiX } from "react-icons/fi";
import { useTranslations } from "next-intl";
import { Reveal, SectionHeading } from "../components/Reveal";
const patients = [
  "patient1",
  "patient2",
  "patient3",
  "patient4",
  "patient5",
] as const;
const traditional = ["traditional1", "traditional2", "traditional3"] as const;
const platform = ["platform1", "platform2", "platform3"] as const;
export default function PatientSearchSection() {
  const t = useTranslations("home");
  return (
    <section className="bg-[#080f1b] px-4 py-16 sm:py-20" id="search">
      <div className="mx-auto w-full max-w-[940px]">
        <SectionHeading
          title={t("searchTitle")}
          description={t("searchDescription")}
        />
        <Reveal className="mx-auto max-w-[570px] rounded-[18px] border border-[#1d2b42] bg-[#111c30] p-3">
          <div className="flex min-h-9 items-center gap-2 rounded-full border border-[#26364e] px-3 text-xs text-[#8593a8]">
            <FiSearch />
            {t("searchPlaceholder")}
          </div>
          <div>
            <div className="grid min-h-9 grid-cols-[1.25fr_1fr_.7fr] items-center gap-2 border-b border-[#1c2a40] text-[10px] text-[#8290a4]">
              <span>{t("table.patient")}</span>
              <span>{t("table.ageGender")}</span>
              <span>{t("table.lastVisit")}</span>
            </div>
            {patients.map((key, index) => (
              <div
                className="grid min-h-12 grid-cols-[1.25fr_1fr_.7fr] items-center gap-2 border-b border-[#1c2a40] last:border-0"
                key={key}
              >
                <span className="text-xs text-[#d3dbe7]">
                  <b className="block">{t(`patients.${key}.name`)}</b>
                  <small className="mt-1 block text-[9px] text-[#74839a]">
                    PT-0148-0100{index}
                  </small>
                </span>
                <span className="text-[10px] text-[#d3dbe7]">
                  {t(`patients.${key}.details`)}
                </span>
                <span className="text-[10px] text-[#d3dbe7]">
                  {t(`patients.${key}.date`)}
                </span>
              </div>
            ))}
          </div>
        </Reveal>
        <p className="my-3 text-center text-[11px] text-[#8190a6]">
          {t("sampleNote")}
        </p>
        <div className="mx-auto mt-9 grid max-w-[550px] gap-2.5 sm:grid-cols-2">
          {[
            {
              title: "traditionalTitle",
              points: traditional,
              Icon: FiX,
              style: "text-rose-500",
            },
            {
              title: "platformTitle",
              points: platform,
              Icon: FiCheck,
              style: "text-[#2dd4bf]",
            },
          ].map((card, index) => (
            <Reveal
              className={`rounded-[18px] border border-[#1d2b42] p-5 ${index === 0 ? "bg-[#111c30]" : "bg-[#070e1a]"}`}
              key={card.title}
            >
              <h3 className="mb-3 text-base font-bold text-[#eaf0fa]">
                {t(card.title)}
              </h3>
              {card.points.map((point) => (
                <p
                  className="mt-2 flex items-center gap-2 text-xs leading-6 text-[#c2ccdb]"
                  key={point}
                >
                  <card.Icon className={card.style} />
                  {t(point)}
                </p>
              ))}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
