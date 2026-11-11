"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { useFontMode, useTextSize, type TextSize } from "@/lib/preferences";

const useMounted = () =>
  useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

const pill =
  "inline-flex h-9 items-center gap-0.5 rounded-full border border-rule bg-bg/70 p-1 text-sm text-ink-soft backdrop-blur-md";
const segment = (active: boolean) =>
  `rounded-full px-3 py-1 transition-all duration-300 ${active ? "bg-primary text-white" : "hover:text-ink"}`;

export function FontToggle() {
  const [font, setFont] = useFontMode();
  return (
    <div className={pill} role="radiogroup" aria-label="نوع خط">
      <button role="radio" aria-checked={font === "nastaliq"} className={segment(font === "nastaliq")} onClick={() => setFont("nastaliq")}>
        نستعلیق
      </button>
      <button role="radio" aria-checked={font === "simple"} className={segment(font === "simple")} onClick={() => setFont("simple")}>
        ساده
      </button>
    </div>
  );
}

const SIZES: { value: TextSize; label: string; className: string }[] = [
  { value: "sm", label: "متن کوچک", className: "text-xs" },
  { value: "md", label: "متن میانه", className: "text-sm" },
  { value: "lg", label: "متن بزرگ", className: "text-lg" },
];

export function SizeToggle() {
  const [size, setSize] = useTextSize();
  return (
    <div className={pill} role="radiogroup" aria-label="اندازهٔ متن">
      {SIZES.map((s) => (
        <button
          key={s.value}
          role="radio"
          aria-checked={size === s.value}
          aria-label={s.label}
          title={s.label}
          className={`${segment(size === s.value)} ${s.className} grid h-7 w-7 place-items-center px-0 py-0 leading-none`}
          onClick={() => setSize(s.value)}
        >
          آ
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useMounted();
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className={`${pill} w-9 justify-center px-0 hover:text-ink`}
      aria-label={dark ? "حالت روز" : "حالت شب"}
      title={dark ? "حالت روز" : "حالت شب"}
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4.2" />
            {Array.from({ length: 8 }, (_, i) => (
              <path key={i} d="M12 2.5v2.2" transform={`rotate(${i * 45} 12 12)`} />
            ))}
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
        )}
      </svg>
    </button>
  );
}
