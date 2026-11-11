import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { paginate, type Page } from "./shahnameh";

// Synchronous reads complete during prerender, so pages stay fully static.
const cache = new Map<string, Page[]>();

export function loadPages(slug: string): Page[] {
  let pages = cache.get(slug);
  if (!pages) {
    const file = path.join(process.cwd(), "public", "stories", `${path.basename(slug)}.json`);
    pages = paginate(JSON.parse(readFileSync(file, "utf8")));
    cache.set(slug, pages);
  }
  return pages;
}
