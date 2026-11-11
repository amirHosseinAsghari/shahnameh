"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;
const reveal = (delay: number) => ({
  initial: { opacity: 0, filter: "blur(12px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  transition: { delay, duration: 1.2, ease: EASE },
});

// The title, then the opening beyt, each surfacing out of a blur.
export function HomeTitle() {
  return (
    <div className="flex flex-col items-center text-center lg:items-start lg:text-start">
      <motion.p {...reveal(0.1)} className="label">
        حکیم ابوالقاسم فردوسی توسی
      </motion.p>
      <motion.h1 {...reveal(0.25)} className="font-nastaliq mt-2 text-7xl leading-[1.9] text-accent sm:text-8xl xl:text-9xl">
        شاهنامه
      </motion.h1>
      <div className="title-font mt-6 space-y-1 text-xl leading-[2.3] text-ink sm:text-2xl">
        <motion.p {...reveal(0.9)}>به نام خداوندِ جان و خرد</motion.p>
        <motion.p {...reveal(1.3)} className="ps-10">
          کز این برتر، اندیشه، بر نگذرد
        </motion.p>
      </div>
    </div>
  );
}
