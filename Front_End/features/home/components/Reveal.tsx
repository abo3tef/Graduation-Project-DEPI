"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Reveal className="mx-auto mb-7 max-w-2xl text-center">
      <h2 className="mb-1 text-2xl font-bold leading-relaxed text-[#eaf0fa] sm:text-3xl">
        {title}
      </h2>
      <p className="text-sm leading-7 text-[#9aa8bd]">{description}</p>
    </Reveal>
  );
}
