"use client";

import { useMemo, useSyncExternalStore } from "react";
import { PREFS } from "./preferences-script";

export type FontMode = "nastaliq" | "simple";
export type TextSize = "sm" | "md" | "lg";
type Pref = keyof typeof PREFS;

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

function usePref<T extends string>(pref: Pref) {
  const { key, fallback } = PREFS[pref];
  const value = useSyncExternalStore(
    subscribe,
    () => (document.documentElement.dataset[pref] ?? fallback) as T,
    () => fallback as T,
  );
  const set = (next: T) => {
    document.documentElement.dataset[pref] = next;
    try {
      localStorage.setItem(key, next);
    } catch {}
    listeners.forEach((fn) => fn());
  };
  return [value, set] as const;
}

export const useFontMode = () => usePref<FontMode>("font");
export const useTextSize = () => usePref<TextSize>("size");

// Last place read, offered on the home page. Kept as a store so every reader of it
// updates when a page is turned (here or in another tab).
export type Bookmark = { slug: string; title: string; page: number; pageCount: number };
const BOOKMARK_KEY = "shahnameh:bookmark";
const BOOKMARK_EVENT = "shahnameh:bookmark-change";

export function saveBookmark(bookmark: Bookmark) {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmark));
  } catch {}
  window.dispatchEvent(new Event(BOOKMARK_EVENT));
}

function subscribeBookmark(onChange: () => void) {
  const onStorage = (e: StorageEvent) => e.key === BOOKMARK_KEY && onChange();
  window.addEventListener(BOOKMARK_EVENT, onChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(BOOKMARK_EVENT, onChange);
    window.removeEventListener("storage", onStorage);
  };
}

// The raw string is the snapshot: it compares by value, so unchanged storage never re-renders.
const rawBookmark = () => {
  try {
    return localStorage.getItem(BOOKMARK_KEY);
  } catch {
    return null;
  }
};

/** `undefined` while unknown (server render and hydration), `null` when nothing is saved. */
export function useBookmark(): Bookmark | null | undefined {
  const raw = useSyncExternalStore(subscribeBookmark, rawBookmark, () => undefined);
  return useMemo(() => {
    if (raw === undefined) return undefined;
    try {
      return raw ? (JSON.parse(raw) as Bookmark) : null;
    } catch {
      return null;
    }
  }, [raw]);
}
