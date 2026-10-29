"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
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

function CategoryLinks({ duplicate = false }: { duplicate?: boolean }) {
  const t = useTranslations("home");

  return (
    <div
      aria-hidden={duplicate}
      className="flex h-full shrink-0 items-center gap-6 px-6 sm:gap-8 sm:px-8"
    >
      {categories.map((key) => (
        <a
          key={duplicate ? `duplicate-${key}` : key}
          href={
            key === "search"
              ? "#search"
              : key === "appointments"
                ? "#journey"
                : "#features"
          }
          tabIndex={duplicate ? -1 : undefined}
          className="group flex shrink-0 items-center gap-2 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.08em] text-[#082c2a] transition-colors hover:text-white sm:text-xs"
        >
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-[#0f766e] transition-colors group-hover:bg-white"
          />
          {t(`category.${key}`)}
        </a>
      ))}
    </div>
  );
}

export default function CategoryBar() {
  const t = useTranslations("home");
  const reduceMotion = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [groupWidth, setGroupWidth] = useState(0);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    const group = groupRef.current;
    const viewport = viewportRef.current;
    if (!group || !viewport) return;

    const measure = () => {
      setGroupWidth(group.getBoundingClientRect().width);
      setViewportWidth(viewport.getBoundingClientRect().width);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(group);
    observer.observe(viewport);

    return () => observer.disconnect();
  }, []);

  const shouldAnimate = !reduceMotion && groupWidth > 0;
  const copyCount =
    groupWidth > 0 && viewportWidth > 0
      ? Math.max(2, Math.ceil(viewportWidth / groupWidth) + 2)
      : 2;

  return (
    <nav
      aria-label={t("categoriesLabel")}
      className="relative isolate h-16 overflow-hidden border-y border-[#2dd4bf]/40 bg-[#0a1220] shadow-[0_8px_24px_rgb(0_0_0/12%)]"
    >
      <div className="absolute inset-y-0 start-0 z-10 flex w-[150px] items-center bg-[#0a1220] px-4 shadow-[8px_0_20px_rgb(10_18_32/70%)] sm:w-[190px] sm:px-6">
        <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.16em] text-[#eaf0fa] sm:text-xs">
          <span
            aria-hidden="true"
            className="h-2 w-2 animate-pulse rounded-full bg-[#2dd4bf] shadow-[0_0_10px_#2dd4bf]"
          />
          {t("categoriesLabel")}
        </div>
      </div>

      <div
        ref={viewportRef}
        dir="ltr"
        className="absolute inset-0 overflow-hidden"
      >
        <motion.div
          className="flex h-full w-max items-center"
          dir="ltr"
          initial={false}
          animate={shouldAnimate ? { x: [0, -groupWidth] } : { x: 0 }}
          transition={
            shouldAnimate
              ? {
                  x: {
                    duration: 32,
                    ease: "linear",
                    repeat: Infinity,
                    repeatType: "loop",
                  },
                }
              : { duration: 0 }
          }
        >
          {Array.from({ length: copyCount }, (_, index) =>
            index === 0 ? (
              <div ref={groupRef} key="category-group">
                <CategoryLinks />
              </div>
            ) : (
              <CategoryLinks duplicate key={`category-copy-${index}`} />
            ),
          )}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-[#0a1220] to-transparent" />
    </nav>
  );
}
