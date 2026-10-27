"use client";
import { FiCheck } from "react-icons/fi";
import { useTranslations } from "next-intl";
import {
  CalendarIllustration,
  MedicalFileIllustration,
  TimelineIllustration,
} from "../components/Illustrations";
import { Reveal } from "../components/Reveal";
const rows = [
  {
    title: "recordTitle",
    description: "recordDescription",
    points: ["recordPoint1", "recordPoint2", "recordPoint3"],
    Art: MedicalFileIllustration,
  },
  {
    title: "timelineTitle",
    description: "timelineDescription",
    Art: TimelineIllustration,
    reverse: true,
  },
  {
    title: "scheduleTitle",
    description: "scheduleDescription",
    points: ["schedulePoint1", "schedulePoint2", "schedulePoint3"],
    Art: CalendarIllustration,
  },
] as const;
export default function PatientDetailsSection() {
  const t = useTranslations("home");
  return (
    <section className="px-4 py-8 sm:py-12" id="patients">
      <div className="mx-auto grid w-full max-w-[940px] gap-9 sm:gap-12">
        {rows.map(({ title, description, points, Art, reverse }) => (
          <Reveal
            className={`grid grid-cols-1 items-center gap-5 md:grid-cols-2 md:gap-16 ${reverse ? "md:[direction:rtl]" : "md:[direction:ltr]"}`}
            key={title}
          >
            <div className="md:[direction:ltr]">
              <Art />
            </div>
            <div className="text-center md:text-start" dir="auto">
              <h2 className="mb-2 text-2xl font-bold leading-snug text-[#eaf0fa]">
                {t(title)}
              </h2>
              <p className="text-sm leading-7 text-[#9aa8bd]">
                {t(description)}
              </p>
              {points && (
                <ul className="mx-auto mt-4 grid w-fit gap-2 text-start md:mx-0">
                  {points.map((point) => (
                    <li
                      className="flex items-center gap-2 text-xs leading-6 text-[#c4cedc]"
                      key={point}
                    >
                      <FiCheck className="shrink-0 text-[#2dd4bf]" />
                      {t(point)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
