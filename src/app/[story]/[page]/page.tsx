import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reader } from "@/components/Reader";
import { artForStory } from "@/lib/art";
import { fa } from "@/lib/fa";
import { getStoryMeta, neighbours, outline, stories } from "@/lib/shahnameh";
import { loadPages } from "@/lib/stories.server";

// Every story/page pair is prerendered below, so awaiting params never blocks in practice.
export const instant = false;

export function generateStaticParams() {
  return stories.flatMap((s) =>
    Array.from({ length: outline(s).pageCount }, (_, i) => ({ story: s.slug, page: String(i + 1) })),
  );
}

async function resolve(params: PageProps<"/[story]/[page]">["params"]) {
  const { story, page } = await params;
  const meta = getStoryMeta(story);
  const n = Number(page);
  if (!meta || !Number.isInteger(n)) notFound();
  const { pageCount, sections } = outline(meta);
  if (n < 1 || n > pageCount) notFound();
  return { meta, n, pageCount, sections };
}

export async function generateMetadata({ params }: PageProps<"/[story]/[page]">): Promise<Metadata> {
  const { meta, n } = await resolve(params);
  return { title: `${meta.title} · صفحهٔ ${fa(n)}` };
}

export default async function ReaderPage({ params }: PageProps<"/[story]/[page]">) {
  const { meta, n, pageCount, sections } = await resolve(params);
  return (
    <Reader
      slug={meta.slug}
      title={meta.title}
      pageCount={pageCount}
      sections={sections}
      initialPage={n}
      initialItems={loadPages(meta.slug)[n - 1]}
      art={artForStory(meta.slug)}
      {...neighbours(meta.slug)}
    />
  );
}
