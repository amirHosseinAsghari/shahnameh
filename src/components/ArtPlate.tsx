"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import type { Painting } from "@/lib/art";

const blur = {
  initial: { opacity: 0, filter: "blur(16px)" },
  animate: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, filter: "blur(16px)", transition: { duration: 0.6 } },
} as const;

export function Caption({ painting, className = "" }: { painting: Painting; className?: string }) {
  return (
    <figcaption className={`space-y-1 text-xs leading-6 text-ink-soft ${className}`}>
      <p className="text-sm text-ink">{painting.title}</p>
      <p>
        {painting.manuscript}
        {painting.folio && <> · {painting.folio}</>}
      </p>
    </figcaption>
  );
}

/** A painting printed in duotone; click to see it in its original colours. */
export function ArtPlate({
  painting,
  className = "",
  sizes,
  eager = false,
  caption = true,
}: {
  painting: Painting;
  className?: string;
  sizes: string;
  eager?: boolean;
  caption?: boolean;
}) {
  const [open, setOpen] = useState(false);
  // The lightbox mounts on first use only, so it never renders on the server.
  const [used, setUsed] = useState(false);
  return (
    <figure className="space-y-4">
      <button
        onClick={() => {
          setUsed(true);
          setOpen(true);
        }}
        className={`duotone group block w-full cursor-zoom-in ${className}`}
        aria-label={`نمایش رنگی نگارهٔ «${painting.title}»`}
      >
        <AnimatePresence initial={false}>
          <motion.div key={painting.id} className="absolute inset-0" {...blur}>
            <Image
              src={painting.src}
              alt={painting.title}
              fill
              sizes={sizes}
              loading={eager ? "eager" : "lazy"}
              className="object-cover transition-transform duration-[1.6s] ease-out group-hover:scale-[1.03]"
            />
          </motion.div>
        </AnimatePresence>
      </button>
      {caption && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={painting.id} {...blur}>
            <Caption painting={painting} />
          </motion.div>
        </AnimatePresence>
      )}
      {used && <Lightbox painting={painting} open={open} onClose={() => setOpen(false)} />}
    </figure>
  );
}

function Lightbox({ painting, open, onClose }: { painting: Painting; open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Portalled to <body> so sticky ancestors can't trap it beneath the header.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-5 bg-bg/90 p-4 backdrop-blur-2xl sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal
          aria-label={painting.title}
        >
          <motion.div
            className="relative h-[72vh] w-full max-w-3xl"
            initial={{ opacity: 0, filter: "blur(20px)", scale: 0.97 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(20px)" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={painting.src} alt={painting.title} fill sizes="(max-width: 768px) 100vw, 768px" className="object-contain" />
          </motion.div>
          <div className="max-w-xl text-center" onClick={(e) => e.stopPropagation()}>
            <Caption painting={painting} />
            <a href={painting.source} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs text-accent underline-offset-4 hover:underline">
              موزهٔ متروپولیتن، نیویورک · مالکیت عمومی ↗
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
