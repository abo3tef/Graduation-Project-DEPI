"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

const categories = [
  "search",
  "appointments",
  "patients",
  "records",
  "diagnoses",
  "medications",
  "allergies",
  "vitals",
  "timeline",
  "documents",
  "permissions",
] as const;

export default function CategoryBar() {
  const t = useTranslations("home");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const reduceMotion = useReducedMotion();

  const containerRef = useRef<HTMLElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  const [groupWidth, setGroupWidth] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // قياس عرض مجموعة العناصر بدقة للتأكد من سلاسة التكرار
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    const measure = () => {
      const width = group.getBoundingClientRect().width;
      if (width > 0) {
        setGroupWidth(width);
      }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(group);

    return () => observer.disconnect();
  }, []);

  return (
    <nav
      ref={containerRef}
      aria-label={t("categoriesLabel")}
      className="relative isolate h-[76px] overflow-hidden border-y border-[#2dd4bf]/30 bg-[#0a1220]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* الحاوية الكلية مع تمديد الهوامش الأفقية `-inset-x-20` لضمان عدم ظهور أي فراغات أثناء الميلان */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-x-32 inset-y-[9px] -rotate-[1deg] bg-[#2dd4bf]">
          <motion.div
            className="flex h-full w-max items-center"
            dir="ltr"
            animate={
              !reduceMotion && groupWidth > 0
                ? {
                    // التحريك بنسبة "-50%" يضمن تطابق النصف الأول مع النصف الثاني تماماً بشكل لا نهائي وسلس
                    x: isHovered ? 0 : ["0%", "-50%"],
                  }
                : { x: 0 }
            }
            transition={{
              x: {
                duration: 30, // سرعة الحركة (كلما زاد الرقم زادت النعومة والبطء)
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              },
            }}
          >
            {/* المجموعة الأولى (الأساسية) */}
            <div
              ref={groupRef}
              className="flex h-full shrink-0 items-center gap-8 px-4"
            >
              {categories.map((key) => (
                <a
                  key={key}
                  href={
                    key === "search"
                      ? "#search"
                      : key === "appointments"
                        ? "#journey"
                        : "#features"
                  }
                  className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[#0a1220] transition-colors hover:text-white"
                >
                  {t(`category.${key}`)}
                </a>
              ))}
            </div>

            {/* المجموعة الثانية (نسخة مطابقة تماماً لتغطية الفراغات وإتمام الـ Loop بسلاسة) */}
            <div
              aria-hidden="true"
              className="flex h-full shrink-0 items-center gap-8 px-4"
            >
              {categories.map((key) => (
                <a
                  key={`dup-1-${key}`}
                  tabIndex={-1}
                  href={
                    key === "search"
                      ? "#search"
                      : key === "appointments"
                        ? "#journey"
                        : "#features"
                  }
                  className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[#0a1220] transition-colors hover:text-white"
                >
                  {t(`category.${key}`)}
                </a>
              ))}
            </div>

            {/* المجموعة الثالثة (لضمان تغطية الشاشات العريضة جداً والـ Ultrawide بدون أي فراغات نهائياً) */}
            <div
              aria-hidden="true"
              className="flex h-full shrink-0 items-center gap-8 px-4"
            >
              {categories.map((key) => (
                <a
                  key={`dup-2-${key}`}
                  tabIndex={-1}
                  href={
                    key === "search"
                      ? "#search"
                      : key === "appointments"
                        ? "#journey"
                        : "#features"
                  }
                  className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[#0a1220] transition-colors hover:text-white"
                >
                  {t(`category.${key}`)}
                </a>
              ))}
            </div>

            {/* المجموعة الرابعة */}
            <div
              aria-hidden="true"
              className="flex h-full shrink-0 items-center gap-8 px-4"
            >
              {categories.map((key) => (
                <a
                  key={`dup-3-${key}`}
                  tabIndex={-1}
                  href={
                    key === "search"
                      ? "#search"
                      : key === "appointments"
                        ? "#journey"
                        : "#features"
                  }
                  className="shrink-0 whitespace-nowrap text-[12px] font-semibold text-[#0a1220] transition-colors hover:text-white"
                >
                  {t(`category.${key}`)}
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </nav>
  );
}
    