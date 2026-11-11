import { notFound, redirect } from "next/navigation";
import { getStoryMeta, stories } from "@/lib/shahnameh";

// Every story/page pair is prerendered below, so awaiting params never blocks in practice.
export const instant = false;

export function generateStaticParams() {
  return stories.map((s) => ({ story: s.slug }));
}

export default async function StoryPage({ params }: PageProps<"/[story]">) {
  const { story } = await params;
  if (!getStoryMeta(story)) notFound();
  redirect(`/${story}/1`);
}
