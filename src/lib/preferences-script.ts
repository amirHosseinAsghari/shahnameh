// Reading preferences live as data-* attributes on <html> so CSS can apply them
// before React hydrates; this inline script restores them on first paint.
export const PREFS = {
  font: { key: "shahnameh:font", fallback: "nastaliq" },
  size: { key: "shahnameh:size", fallback: "md" },
} as const;

export const PREFERENCES_SCRIPT = `try{var d=document.documentElement;${Object.entries(PREFS)
  .map(([attr, p]) => `d.dataset.${attr}=localStorage.getItem(${JSON.stringify(p.key)})||${JSON.stringify(p.fallback)};`)
  .join("")}}catch(e){}`;
