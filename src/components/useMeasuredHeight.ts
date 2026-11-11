"use client";

import { useCallback, useState } from "react";

/** Tracks an element's height; the returned ref can move between elements (e.g. keyed pages). */
export function useMeasuredHeight<T extends HTMLElement>() {
  const [height, setHeight] = useState<number | "auto">("auto");
  const ref = useCallback((node: T | null) => {
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize[0].blockSize));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return [ref, height] as const;
}
