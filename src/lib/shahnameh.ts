// Shared (server + client) types and pagination for the Shahnameh text.
import index from "@/data/index.json";

export type Beyt = [string, string];
export type Section = { title: string; beyts: Beyt[] };
export type Story = { slug: string; title: string; sections: Section[] };

export type PageItem =
  | { kind: "heading"; title: string; section: number }
  | { kind: "beyt"; beyt: Beyt; n: number };
export type Page = PageItem[];

export type StoryMeta = { slug: string; title: string; sections: { title: string; beytCount: number }[] };

export const stories = index as StoryMeta[];

/** How much vertical room a page holds, measured in beyts. A section heading costs two. */
const PAGE_BUDGET = 10;
const HEADING_COST = 2;

/**
 * Splits a story into fixed pages. Depends only on beyt counts, so the same
 * page numbers come out on the server (from the index) and the client (from the text).
 */
function layout<T>(
  sections: { title: string; beytCount: number }[],
  beytAt: (section: number, i: number) => T,
  heading: (section: number) => T,
): T[][] {
  const pages: T[][] = [];
  let page: T[] = [];
  let used = 0;
  const flush = () => {
    if (page.length) pages.push(page);
    page = [];
    used = 0;
  };

  sections.forEach((section, s) => {
    // Hide the heading of a story that is just one untitled section.
    const showHeading = sections.length > 1 || section.title !== "";
    if (showHeading) {
      // Never leave a heading stranded at the foot of a page.
      if (used + HEADING_COST + 2 > PAGE_BUDGET) flush();
      page.push(heading(s));
      used += HEADING_COST;
    }
    for (let i = 0; i < section.beytCount; i++) {
      if (used + 1 > PAGE_BUDGET) flush();
      page.push(beytAt(s, i));
      used += 1;
    }
  });
  flush();
  return pages;
}

export function paginate(story: Story): Page[] {
  const meta = story.sections.map((s) => ({ title: s.title, beytCount: s.beyts.length }));
  return layout<PageItem>(
    meta,
    (s, i) => ({ kind: "beyt", beyt: story.sections[s].beyts[i], n: i + 1 }),
    (s) => ({ kind: "heading", title: story.sections[s].title, section: s }),
  );
}

/** Page count and the page each section starts on, computed from the index alone. */
export function outline(meta: StoryMeta) {
  const pages = layout(
    meta.sections,
    (s) => ({ s, heading: false }),
    (s) => ({ s, heading: true }),
  );
  const sectionPages: number[] = [];
  pages.forEach((page, p) =>
    page.forEach((item) => {
      sectionPages[item.s] ??= p + 1;
    }),
  );
  return {
    pageCount: pages.length,
    sections: meta.sections.map((s, i) => ({ title: s.title, page: sectionPages[i] ?? 1 })),
  };
}

export const getStoryMeta = (slug: string) => stories.find((s) => s.slug === slug);

export function neighbours(slug: string) {
  const i = stories.findIndex((s) => s.slug === slug);
  const pick = (s?: StoryMeta) => (s ? { slug: s.slug, title: s.title } : null);
  return { prev: pick(stories[i - 1]), next: pick(stories[i + 1]) };
}

export const beytTotal = (meta: StoryMeta) => meta.sections.reduce((n, s) => n + s.beytCount, 0);

/** The four great ages of the Shahnameh, by the slug each one starts with. */
export const ERAS = [
  { start: "aghaz", title: "دیباچه", subtitle: "ستایش خرد و آغاز سخن" },
  { start: "qmars", title: "پیشدادیان", subtitle: "از کیومرث تا گرشاسپ" },
  { start: "kqobad", title: "کیانیان", subtitle: "روزگار پهلوانان؛ از کیقباد تا دارا" },
  { start: "eskandar", title: "اسکندر و اشکانیان", subtitle: "از اسکندر تا اردوان" },
  { start: "ardeshir", title: "ساسانیان", subtitle: "از اردشیر بابکان تا یزدگرد" },
] as const;

export function storiesByEra() {
  return ERAS.map((era, e) => {
    const from = stories.findIndex((s) => s.slug === era.start);
    const to = e + 1 < ERAS.length ? stories.findIndex((s) => s.slug === ERAS[e + 1].start) : stories.length;
    return { ...era, stories: stories.slice(from, to) };
  });
}
