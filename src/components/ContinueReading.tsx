"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { fa } from "@/lib/fa";
import { useBookmark } from "@/lib/preferences";

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

  if (!bookmark) return <FluidButton href="/aghaz/1">آغاز خواندن</FluidButton>;

  return (
    <motion.div
      initial={{ opacity: 0, filter: "blur(8px)" }}
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className="flex flex-col items-center gap-4 lg:items-start"
    >
      <FluidButton href={`/${bookmark.slug}/${bookmark.page}`}>
        ادامهٔ خواندن
        <span className="text-white/70">
          {bookmark.title} · صفحهٔ {fa(bookmark.page)}
        </span>
      </FluidButton>
      <Link
        href="/aghaz/1"
        className="rounded-full border border-accent/50 px-6 py-2.5 text-sm text-accent transition-colors duration-300 hover:border-accent hover:bg-wash"
      >
        خواندن از آغاز
      </Link>
    </motion.div>
  );
}
