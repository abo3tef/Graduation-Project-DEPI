"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FiActivity, FiPlus, FiUsers } from "react-icons/fi";

const panel =
  "relative mx-auto h-[190px] w-full max-w-[270px] overflow-hidden rounded-[22px] bg-[#102e35] sm:h-[200px]";

export function MedicalFileIllustration() {
  return (
    <div className={`${panel} p-5`} aria-hidden="true">
      <div className="absolute inset-[11%_17%] rounded-[13px] bg-white px-4 pt-7">
        <i className="absolute -top-2 left-[29%] grid h-5 w-[42%] place-items-center rounded-lg bg-[#0f827a] text-white">
          <FiPlus />
        </i>
        <b className="mb-2 block h-1.5 w-1/2 rounded-full bg-[#0d1b32]" />
        <b className="block h-1.5 w-[30%] rounded-full bg-slate-300" />
        <div className="mt-3 flex gap-2">
          <span className="grid h-10 flex-1 place-items-center rounded-lg bg-[#e2f3f1] text-xl text-[#10857d]">
            <FiActivity />
          </span>
          <span className="grid flex-1 content-center gap-1 rounded-lg bg-[#e2f3f1] px-2">
            <i className="h-1 w-4 rounded bg-[#11877d]" />
            <i className="h-1.5 w-12 rounded bg-[#0d1b32]" />
          </span>
        </div>
        <i className="mt-3 block h-1 w-full rounded bg-slate-200" />
        <i className="mt-2 block h-1 w-3/4 rounded bg-slate-200" />
        <i className="mt-2 block h-1 w-[88%] rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function TimelineIllustration() {
  return (
    <div className={`${panel} max-w-[260px]`} aria-hidden="true">
      <div className="absolute bottom-[10%] left-1/2 top-[10%] w-[3px] -translate-x-1/2 rounded bg-[#72d6cc]" />
      {[0, 1, 2, 3].map((item) => (
        <div
          className={`absolute flex h-[31px] w-[42%] items-center gap-1.5 rounded-lg bg-white px-2 ${item % 2 ? "right-[55%]" : "left-[55%]"} ${["top-[14%]", "top-[36%]", "top-[59%]", "top-[80%]"][item]}`}
          key={item}
        >
          <i
            className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${item === 1 ? "bg-rose-500" : item === 2 ? "bg-blue-600" : "bg-[#0f827a]"} ${item % 2 ? "-right-[5px]" : "-left-[5px]"}`}
          />
          <span className="h-1 w-1/2 rounded bg-[#0d1b32]" />
          <span className="h-1 w-1/3 rounded bg-slate-300" />
        </div>
      ))}
    </div>
  );
}

export function CalendarIllustration() {
  return (
    <div className={`${panel} max-w-[270px]`} aria-hidden="true">
      <div className="absolute inset-[9%_8%] grid grid-cols-7 content-start gap-1.5 rounded-[14px] bg-white px-3 pb-12 pt-6">
        <i className="absolute left-[10%] top-2 h-1.5 w-[29%] rounded bg-[#0d1b32]" />
        {Array.from({ length: 21 }, (_, i) => (
          <i
            className={`h-[17px] rounded-[5px] ${[8, 11].includes(i) ? "bg-[#0f827a]" : i === 12 ? "bg-rose-500" : i === 16 ? "bg-blue-600" : "bg-[#e1f3f1]"}`}
            key={i}
          />
        ))}
        <span className="absolute inset-x-[5%] bottom-[19px] h-[17px] rounded bg-[#132139] before:absolute before:left-2 before:top-1.5 before:h-1 before:w-[30%] before:rounded before:bg-[#2dd4bf] before:content-['']" />
        <span className="absolute inset-x-[5%] bottom-0 h-[17px] rounded bg-[#132139]/75" />
      </div>
    </div>
  );
}

export function HeroIllustration() {
  const reduceMotion = useReducedMotion();
  const floatTransition = { duration: 4.5, repeat: Infinity, ease: "easeInOut" as const };

  return (
    <div
      className="relative mx-auto h-[260px] w-full max-w-[400px] text-[#20d5c4]"
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse,#123b42_0%,transparent_70%)] blur-lg"
        animate={reduceMotion ? undefined : { opacity: [0.45, 0.8, 0.45], scale: [0.94, 1.06, 0.94] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute left-[14%] top-6 h-[168px] w-[55%] rounded-[18px] bg-white p-[15px] shadow-[15px_12px_0_#142746]"
        initial={reduceMotion ? false : { opacity: 0, y: 18, scale: 0.96 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: [0, -5, 0], scale: 1 }}
        transition={reduceMotion ? undefined : { opacity: { duration: 0.7 }, scale: { duration: 0.7 }, y: { ...floatTransition, delay: 0.8 } }}
      >
        <motion.div
          className="grid h-[30px] w-[30px] place-items-center rounded-full bg-[#c9eeea] text-[#147f77]"
          animate={reduceMotion ? undefined : { scale: [1, 1.08, 1] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <FiUsers />
        </motion.div>
        <div className="absolute left-1/4 top-[18px] grid w-1/2 gap-[7px]">
          <i className="h-1.5 rounded-full bg-[#0d1b32]" />
          <i className="h-1.5 w-2/3 rounded-full bg-slate-300" />
        </div>
        <div className="relative mt-2 h-[17px] rounded-lg bg-rose-100 before:ml-2 before:mt-[5px] before:block before:h-[7px] before:w-[7px] before:rounded-full before:bg-rose-500 before:content-['']">
          <motion.span
            className="absolute right-0 top-0 h-[7px] w-[7px] rounded-full bg-rose-500"
            animate={reduceMotion ? undefined : { scale: [1, 1.8, 1], opacity: [1, 0.55, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <div className="mt-2 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.i
              key={i}
              className="h-[34px] flex-1 rounded-lg bg-[#eef3f9]"
              animate={reduceMotion ? undefined : { opacity: [0.72, 1, 0.72] }}
              transition={{ duration: 2.4, delay: i * 0.25, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
        <i className="mt-3 block h-1 rounded bg-slate-200" />
        <i className="mt-2 block h-1 w-3/4 rounded bg-slate-200" />
      </motion.div>
      <motion.div
        className="absolute bottom-[42px] right-[12%] z-10 grid h-[52px] w-[94px] content-center gap-1 rounded-[14px] bg-[#2dd4bf] p-2.5 shadow-lg"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: [0, -7, 0] }}
        transition={reduceMotion ? undefined : { opacity: { duration: 0.5, delay: 0.3 }, scale: { duration: 0.5, delay: 0.3 }, y: { ...floatTransition, delay: 1 } }}
      >
        <i className="h-1 w-1/2 rounded bg-[#09213b]" />
        <i className="h-1 w-4/5 rounded bg-[#09213b]/70" />
        <span className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.i
              key={i}
              className="h-[7px] w-[7px] rounded-full bg-[#087a72]"
              animate={reduceMotion ? undefined : { y: [0, -2, 0] }}
              transition={{ duration: 0.8, delay: i * 0.13, repeat: Infinity, repeatDelay: 1.2, ease: "easeInOut" }}
            />
          ))}
        </span>
      </motion.div>
      <svg className="absolute bottom-0 right-[7%] w-[78%]" viewBox="0 0 280 54" fill="none">
        <motion.path
          d="M2 28h64l12-23 18 43 17-31 12 11h153"
          stroke="currentColor"
          strokeWidth="2"
          animate={reduceMotion ? undefined : { opacity: [0.65, 1, 0.65], pathLength: [0.9, 1, 0.9] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
    </div>
  );
}
