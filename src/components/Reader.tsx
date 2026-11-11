"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { ArtPlate } from "@/components/ArtPlate";
import { FontToggle, SizeToggle, ThemeToggle } from "@/components/Controls";
import { Rule } from "@/components/Ornament";
import { TocDrawer } from "@/components/TocDrawer";
import { useMeasuredHeight } from "@/components/useMeasuredHeight";
import { artForPage, type Painting } from "@/lib/art";
import { fa, fromFa } from "@/lib/fa";
import { saveBookmark } from "@/lib/preferences";
import { paginate, type Page, type Story } from "@/lib/shahnameh";

type StoryLink = { slug: string; title: string } | null;

type ReaderProps = {
  slug: string;
  title: string;
  pageCount: number;
  sections: { title: string; page: number }[];
  initialPage: number;
  initialItems: Page;
  art: Painting[];
  prev: StoryLink;
  next: StoryLink;
};

const EASE = [0.22, 1, 0.36, 1] as const;

// Pages dissolve through a blur. Moving forward, the new page drifts in from the
// right (where the «next» control sits) and the old one drifts away to the left.
const blur: Variants = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 16, filter: "blur(12px)" }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.55, delay: 0.08, ease: EASE, staggerChildren: 0.02 },
  },
  exit: (dir: number) => ({
    opacity: 0,
    x: dir * -16,
    filter: "blur(12px)",
    transition: { duration: 0.35, ease: "easeIn" },
  }),
};

const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const line: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export function Reader(props: ReaderProps) {
  const { slug, title, pageCount, sections, initialPage, initialItems, art, prev, next } = props;
  const router = useRouter();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  const fromPath = Number(pathname.split("/").pop());
  const current = Number.isInteger(fromPath) && fromPath >= 1 && fromPath <= pageCount ? fromPath : initialPage;

  // The whole story loads in the background; from then on pages change instantly.
  const [pages, setPages] = useState<Page[] | null>(null);
  useEffect(() => {
    let alive = true;
    fetch(`/stories/${slug}.json`)
      .then((r) => r.json() as Promise<Story>)
      .then((story) => alive && setPages(paginate(story)))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [slug]);

  // Direction of the most recent turn, derived from page changes (so Back/Forward animate too).
  const [shown, setShown] = useState(current);
  const [dir, setDir] = useState(1);
  if (shown !== current) {
    setDir(current > shown ? 1 : -1);
    setShown(current);
  }

  const items = pages?.[current - 1] ?? (current === initialPage ? initialItems : null);
  const painting = artForPage(art, current, pageCount);

  const go = useCallback(
    (n: number) => {
      if (n < 1 || n > pageCount || n === current) return;
      const href = `/${slug}/${n}`;
      if (pages) window.history.pushState(null, "", href);
      else router.push(href, { scroll: false });
    },
    [current, pageCount, pages, router, slug],
  );

  const [tocOpen, setTocOpen] = useState(false);
  const [pageRef, pageHeight] = useMeasuredHeight<HTMLElement>();

  useEffect(() => {
    saveBookmark({ slug, title, page: current, pageCount });
    // Client-side turns skip generateMetadata, so keep the tab title in step.
    document.title = `${title} · صفحهٔ ${fa(current)} | شاهنامه`;
    if (window.scrollY > 80) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [current, pageCount, slug, title]);

  // Keyboard: → moves forward and ← moves back, matching the controls below.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inField = e.target instanceof Element && e.target.closest("input, textarea, select");
      if (e.metaKey || e.ctrlKey || e.altKey || inField) return;
      if (e.key === "ArrowRight") go(current + 1);
      else if (e.key === "ArrowLeft") go(current - 1);
      else if (e.key === "Home") go(1);
      else if (e.key === "End") go(pageCount);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, go, pageCount]);

  // Swipe left for the next page, right for the previous one.
  const touch = useRef<{ x: number; y: number } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touch.current;
    touch.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx) * 0.7) return;
    go(dx < 0 ? current + 1 : current - 1);
  };

  const sectionIndex = sections.reduce((found, s, i) => (s.page <= current ? i : found), 0);
  const progress = pageCount > 1 ? (current - 1) / (pageCount - 1) : 1;

  const navLink = (n: number) => ({
    href: `/${slug}/${n}`,
    scroll: false,
    onClick: (e: React.MouseEvent) => {
      if (!pages) return;
      e.preventDefault();
      go(n);
    },
  });

  return (
    <div className="relative flex min-h-dvh flex-col">
      {/* Phones: the painting as a band behind the header, fading into the page. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[42vh] lg:hidden" aria-hidden>
        <div className="duotone absolute inset-0 opacity-90">
          <AnimatePresence initial={false}>
            <motion.div
              key={painting.id}
              className="absolute inset-0"
              initial={{ opacity: 0, filter: "blur(16px)" }}
              animate={{ opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } }}
              exit={{ opacity: 0, filter: "blur(16px)", transition: { duration: 0.6 } }}
            >
              <Image src={painting.src} alt="" fill sizes="100vw" className="object-cover object-[50%_35%]" />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg/40 to-bg" />
      </div>

      <header className="sticky top-0 z-30 border-b border-rule bg-bg/75 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="shrink-0 font-nastaliq text-xl leading-none text-accent transition-opacity hover:opacity-70" aria-label="بازگشت به فهرست">
            شاهنامه
          </Link>
          <span className="h-5 w-px bg-rule" aria-hidden />
          <button
            onClick={() => setTocOpen(true)}
            className="flex min-w-0 items-center gap-2 rounded-full px-2 py-1 text-start text-sm text-ink-soft transition-colors hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h10" />
            </svg>
            <span className="truncate">
              <span className="text-ink">{title}</span>
              {sections[sectionIndex]?.title && sections.length > 1 && (
                <span className="hidden md:inline"> · {sections[sectionIndex].title}</span>
              )}
            </span>
          </button>
          <div className="ms-auto hidden items-center gap-2 md:flex">
            <FontToggle />
            <SizeToggle />
            <ThemeToggle />
          </div>
          <div className="ms-auto md:hidden">
            <ThemeToggle />
          </div>
        </div>
        <div className="h-px bg-rule">
          <motion.div
            className="h-full origin-right bg-accent"
            animate={{ scaleX: progress }}
            transition={{ duration: 0.8, ease: EASE }}
          />
        </div>
      </header>

      <div className="relative flex justify-center px-4 pt-[22vh] md:hidden">
        <FontToggle />
      </div>

      <main className="relative mx-auto grid w-full max-w-6xl flex-1 items-start gap-10 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] lg:gap-12">
        <motion.div
          className="relative [overflow-clip-margin:2rem] [overflow-y:clip]"
          animate={{ height: pageHeight }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.5, ease: EASE }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <AnimatePresence mode="popLayout" initial={false} custom={dir}>
            {items && (
              <motion.article
                key={current}
                ref={pageRef}
                custom={dir}
                variants={reduceMotion ? fade : blur}
                initial="enter"
                animate="center"
                exit="exit"
                className="w-full rounded-sm border border-rule bg-surface px-5 pt-10 pb-8 sm:px-10 sm:pt-12 sm:pb-10"
              >
                <PageContent items={items} page={current} pageCount={pageCount} title={title} next={next} />
              </motion.article>
            )}
          </AnimatePresence>
        </motion.div>

        <aside className="sticky top-24 hidden lg:block">
          <ArtPlate painting={painting} className="aspect-[2/3]" sizes="18rem" eager />
        </aside>
      </main>

      <footer className="sticky bottom-0 z-20 pb-[env(safe-area-inset-bottom)]">
        {/* Laid out left-to-right on purpose: «قبل» on the left, «بعد» on the right. */}
        <nav dir="ltr" aria-label="صفحه‌ها" className="mx-auto mb-4 flex w-fit items-center gap-1 rounded-full border border-rule bg-bg/85 p-1 shadow-[0_8px_30px_-12px_rgb(28_57_187_/_0.25)] backdrop-blur-xl">
          <NavPill disabled={current <= 1} {...navLink(current - 1)}>
            <Chevron dir="left" /> <span dir="rtl" className="hidden sm:inline">صفحهٔ قبل</span>
          </NavPill>
          <PageJump current={current} pageCount={pageCount} onJump={go} />
          <NavPill disabled={current >= pageCount} {...navLink(current + 1)}>
            <span dir="rtl" className="hidden sm:inline">صفحهٔ بعد</span> <Chevron dir="right" />
          </NavPill>
        </nav>
      </footer>

      <TocDrawer
        open={tocOpen}
        onClose={() => setTocOpen(false)}
        title={title}
        sections={sections}
        current={sectionIndex}
        onSelect={(page) => {
          setTocOpen(false);
          go(page);
        }}
        prev={prev}
        next={next}
      >
        <div className="flex flex-wrap items-center gap-2 md:hidden">
          <SizeToggle />
        </div>
      </TocDrawer>
    </div>
  );
}

function PageContent({
  items,
  page,
  pageCount,
  title,
  next,
}: {
  items: Page;
  page: number;
  pageCount: number;
  title: string;
  next: StoryLink;
}) {
  return (
    <>
      {page === 1 ? (
        <motion.header variants={line} className="mb-10 text-center">
          <p className="label">شاهنامهٔ فردوسی</p>
          <h1 className="title-font mt-3 text-3xl leading-[2] text-accent sm:text-4xl">{title}</h1>
          <Rule className="mx-auto mt-4 max-w-40" />
        </motion.header>
      ) : (
        <motion.p variants={line} className="label mb-6 text-center">
          {title}
        </motion.p>
      )}

      <div className="verse verse-grid">
        {items.map((item, i) =>
          item.kind === "heading" ? (
            <motion.div key={i} variants={line} className={`text-center ${i > 0 ? "mt-8" : ""} mb-4`}>
              <p className="label">بخش {fa(item.section + 1)}</p>
              <h2 className="title-font mt-1 text-[1.05rem] leading-[2.2] text-balance text-accent sm:text-lg">{item.title}</h2>
              <span className="mx-auto mt-2 block h-px w-10 bg-accent/40" aria-hidden />
            </motion.div>
          ) : (
            <motion.p key={i} variants={line} className="beyt" data-n={item.n}>
              <span className="misra">{item.beyt[0]}</span>
              <span className="beyt-mark flex justify-center" aria-hidden>
                <span className="h-1 w-1 rounded-full bg-accent/30" />
              </span>
              <span className="misra">{item.beyt[1]}</span>
            </motion.p>
          ),
        )}
      </div>

      {page === pageCount && (
        <motion.div variants={line} className="mt-12 flex flex-col items-center gap-4 text-center">
          <Rule className="w-40" />
          <p className="title-font text-lg text-accent">پایان {title}</p>
          {next && (
            <Link
              href={`/${next.slug}/1`}
              className="rounded-full bg-primary px-5 py-2 text-sm text-white transition-opacity hover:opacity-85"
            >
              داستان بعد: {next.title}
            </Link>
          )}
        </motion.div>
      )}

      <motion.p variants={line} className="mt-10 text-center text-xs tracking-[0.2em] text-ink-soft">
        {fa(page)} / {fa(pageCount)}
      </motion.p>
    </>
  );
}

type NavLinkProps = {
  href: string;
  scroll: boolean;
  onClick: (e: React.MouseEvent) => void;
};

function NavPill({ disabled, children, ...link }: NavLinkProps & { disabled: boolean; children: React.ReactNode }) {
  const cls = "flex h-10 items-center gap-2 rounded-full px-3 text-sm transition-all duration-300 sm:px-4";
  if (disabled) return <span className={`${cls} text-ink-soft/40`}>{children}</span>;
  return (
    <Link {...link} className={`${cls} text-ink hover:bg-primary hover:text-white`}>
      {children}
    </Link>
  );
}

function PageJump({ current, pageCount, onJump }: { current: number; pageCount: number; onJump: (n: number) => void }) {
  return (
    <form
      key={current}
      dir="rtl"
      className="flex items-center gap-1.5 px-2 text-sm text-ink-soft"
      onSubmit={(e) => {
        e.preventDefault();
        const raw = new FormData(e.currentTarget).get("page") as string;
        const n = Number(fromFa(raw));
        if (Number.isInteger(n)) onJump(Math.min(Math.max(n, 1), pageCount));
        (e.currentTarget.elements.namedItem("page") as HTMLInputElement).blur();
      }}
    >
      <input
        name="page"
        defaultValue={fa(current)}
        inputMode="numeric"
        aria-label="شمارهٔ صفحه"
        className="h-8 w-12 rounded-full border border-rule bg-transparent text-center font-medium text-ink outline-none transition focus:border-accent"
        onFocus={(e) => e.currentTarget.select()}
      />
      <span>از {fa(pageCount)}</span>
    </form>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
    </svg>
  );
}
