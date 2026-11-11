import art from "@/data/art.json";
import { ERAS, storiesByEra } from "./shahnameh";

export type Painting = {
  id: number;
  src: string;
  width: number;
  height: number;
  title: string;
  folio: string | null;
  manuscript: string;
  source: string;
};

const paintings = art as (Painting & { stories: string[] })[];

const strip = ({ id, src, width, height, title, folio, manuscript, source }: Painting): Painting => ({
  id,
  src,
  width,
  height,
  title,
  folio,
  manuscript,
  source,
});

// The painting that stands for each era when a story has none of its own.
const ERA_LEAD: Record<(typeof ERAS)[number]["start"], number> = {
  aghaz: 452110,
  qmars: 452111,
  kqobad: 452149,
  eskandar: 452657,
  ardeshir: 452168,
};

export const paintingById = (id: number) => strip(paintings.find((p) => p.id === id)!);

export function eraPainting(start: (typeof ERAS)[number]["start"]) {
  return paintingById(ERA_LEAD[start]);
}

export function artForStory(slug: string): Painting[] {
  const own = paintings.filter((p) => p.stories.includes(slug));
  if (own.length) return own.map(strip);
  const era = storiesByEra().find((e) => e.stories.some((s) => s.slug === slug));
  return [eraPainting(era?.start ?? "aghaz")];
}

/** Long stories walk through their paintings as the reader progresses. */
export function artForPage(art: Painting[], page: number, pageCount: number) {
  return art[Math.min(art.length - 1, Math.floor(((page - 1) / pageCount) * art.length))];
}
