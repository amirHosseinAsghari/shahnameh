"use client";

import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { fa } from "@/lib/fa";
import { useBookmark } from "@/lib/preferences";

const EASE = [0.22, 1, 0.36, 1] as const;

// Surfaces after the opening beyt (see HomeTitle), one button after the other.
const group: Variants = {
  hidden: {},
  shown: { transition: { delayChildren: 1.7, staggerChildren: 0.18 } },
};
const item: Variants = {
  hidden: { opacity: 0, filter: "blur(12px)" },
  shown: { opacity: 1, filter: "blur(0px)", transition: { duration: 1.1, ease: EASE } },
};

/** The main call to action: a hairline border with a slowly travelling sheen. */
function FluidButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="fluid-btn">
      <span className="fluid-inner">{children}</span>
    </Link>
  );
}

export function ContinueReading() {
  const bookmark = useBookmark();

  return (
    // The box keeps the height of both buttons, so nothing shifts while the bookmark is read.
    <div className="flex min-h-[6.75rem] flex-col items-center lg:items-start">
      {bookmark !== undefined && (
        <motion.div variants={group} initial="hidden" animate="shown" className="flex flex-col items-center gap-4 lg:items-start">
          <motion.div variants={item}>
            {bookmark ? (
              <FluidButton href={`/${bookmark.slug}/${bookmark.page}`}>
                ادامهٔ خواندن
                <span className="text-white/70">
                  {bookmark.title} · صفحهٔ {fa(bookmark.page)}
                </span>
              </FluidButton>
            ) : (
              <FluidButton href="/aghaz/1">آغاز خواندن</FluidButton>
            )}
          </motion.div>
          {bookmark && (
            <motion.div variants={item}>
              <Link
                href="/aghaz/1"
                className="inline-block rounded-full border border-accent/50 px-6 py-2.5 text-sm text-accent transition-colors duration-300 hover:border-accent hover:bg-wash"
              >
                خواندن از آغاز
              </Link>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
