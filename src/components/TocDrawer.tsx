"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Rule } from "@/components/Ornament";
import { fa } from "@/lib/fa";

type StoryLink = { slug: string; title: string } | null;

export function TocDrawer({
  open,
  onClose,
  title,
  sections,
  current,
  onSelect,
  prev,
  next,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sections: { title: string; page: number }[];
  current: number;
  onSelect: (page: number) => void;
  prev: StoryLink;
  next: StoryLink;
  children?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal aria-label="فهرست بخش‌ها">
          <motion.div
            className="absolute inset-0 bg-primary/15 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-[min(24rem,88vw)] flex-col border-l border-rule bg-bg"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 32 }}
          >
            <div className="flex items-start justify-between gap-3 px-6 pt-6">
              <div>
                <p className="label">فهرست بخش‌ها</p>
                <h2 className="title-font mt-1 text-xl leading-[2] text-accent">{title}</h2>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-soft transition hover:bg-wash hover:text-ink"
                aria-label="بستن"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <Rule className="mx-6 my-3" />
            <ol className="flex-1 overflow-y-auto px-3 pb-4">
              {sections.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + Math.min(i, 20) * 0.02 }}
                >
                  <button
                    onClick={() => onSelect(s.page)}
                    className={`flex w-full items-baseline gap-3 rounded-lg px-3 py-2.5 text-start text-sm transition ${
                      i === current ? "bg-primary text-white" : "text-ink-soft hover:bg-wash hover:text-ink"
                    }`}
                  >
                    <span className="w-6 shrink-0 text-xs opacity-70">{fa(i + 1)}</span>
                    <span className="flex-1 leading-7">{s.title || title}</span>
                    <span className="shrink-0 text-xs opacity-60">ص {fa(s.page)}</span>
                  </button>
                </motion.li>
              ))}
            </ol>
            <div className="space-y-3 border-t border-rule px-6 py-4 text-sm">
              {children}
              <div className="flex items-center justify-between gap-2 text-ink-soft">
                {prev ? (
                  <Link href={`/${prev.slug}/1`} className="truncate transition hover:text-ink">
                    → {prev.title}
                  </Link>
                ) : (
                  <span />
                )}
                {next && (
                  <Link href={`/${next.slug}/1`} className="truncate transition hover:text-ink">
                    {next.title} ←
                  </Link>
                )}
              </div>
              <Link
                href="/"
                className="block rounded-full border border-rule py-2 text-center text-ink transition hover:bg-primary hover:text-white"
              >
                همهٔ داستان‌ها
              </Link>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
