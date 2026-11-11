// Downloads the full Shahnameh from Ganjoor (https://ganjoor.net) into public/stories/ and src/data/index.json.
// Usage: npx tsx scripts/fetch-shahnameh.ts   (resumable — finished stories are skipped)
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import path from "node:path";

const API = "https://api.ganjoor.net/api/ganjoor";
const ROOT = "/ferdousi/shahname";
// Story texts are served statically (the reader loads them client-side); the index is imported by the app.
const STORIES = path.join(process.cwd(), "public", "stories");
const INDEX = path.join(process.cwd(), "src", "data", "index.json");
const CONCURRENCY = 4;

type Cat = {
  cat: {
    title: string;
    children: { title: string; fullUrl: string; urlSlug: string }[];
    poems: { id: number; title: string; urlSlug: string }[] | null;
  };
};
type Poem = { verses: { vOrder: number; versePosition: number; text: string }[] };

async function get<T>(url: string, tries = 5): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, { headers: { accept: "application/json" } });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return (await res.json()) as T;
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 800 * i));
    }
  }
}

async function pool<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

const clean = (s: string) => s.replace(/\s+/g, " ").trim();

// "بخش ۱ - آغاز کتاب" → "آغاز کتاب"
const sectionTitle = (t: string) => clean(t.replace(/^بخش\s+[۰-۹0-9]+\s*-\s*/, ""));

function toBeyts(poem: Poem): [string, string][] {
  const verses = [...poem.verses].sort((a, b) => a.vOrder - b.vOrder);
  const beyts: [string, string][] = [];
  for (let i = 0; i < verses.length; i++) {
    const v = verses[i];
    if (v.versePosition === 0 && verses[i + 1]?.versePosition === 1) {
      beyts.push([clean(v.text), clean(verses[i + 1].text)]);
      i++;
    } else {
      // Unpaired or non-couplet verse: keep it on its own line.
      beyts.push([clean(v.text), ""]);
    }
  }
  return beyts;
}

const exists = (p: string) => access(p).then(() => true, () => false);

async function main() {
  await mkdir(STORIES, { recursive: true });
  await mkdir(path.dirname(INDEX), { recursive: true });
  const root = await get<Cat>(`${API}/cat?url=${ROOT}&poems=true&mainSections=false`);
  const index = [];

  for (const child of root.cat.children) {
    const slug = child.fullUrl.split("/").pop()!;
    const file = path.join(STORIES, `${slug}.json`);

    let story: { slug: string; title: string; sections: { title: string; beyts: [string, string][] }[] };
    if (await exists(file)) {
      story = JSON.parse(await readFile(file, "utf8"));
      console.log(`✓ ${slug} (cached)`);
    } else {
      const cat = await get<Cat>(`${API}/cat?url=${encodeURI(child.fullUrl)}&poems=true&mainSections=false`);
      const poems = cat.cat.poems ?? [];
      const sections = await pool(poems, async (p) => {
        const poem = await get<Poem>(
          `${API}/poem/${p.id}?catInfo=false&rhymes=false&recitations=false&images=false&songs=false&comments=false&verseDetails=true&navigation=false&relatedpoems=false`,
        );
        return { title: sectionTitle(p.title), beyts: toBeyts(poem) };
      });
      story = { slug, title: clean(child.title), sections };
      await writeFile(file, JSON.stringify(story));
      console.log(`↓ ${slug}: ${sections.length} sections`);
    }

    index.push({
      slug,
      title: story.title,
      sections: story.sections.map((s) => ({ title: s.title, beytCount: s.beyts.length })),
    });
  }

  await writeFile(INDEX, JSON.stringify(index, null, 1));
  const total = index.reduce((n, s) => n + s.sections.reduce((m, x) => m + x.beytCount, 0), 0);
  console.log(`Done: ${index.length} stories, ${total} beyts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
