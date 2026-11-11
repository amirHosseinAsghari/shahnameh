import Image from "next/image";
import Link from "next/link";
import { ArtPlate } from "@/components/ArtPlate";
import { ContinueReading } from "@/components/ContinueReading";
import { FontToggle, ThemeToggle } from "@/components/Controls";
import { HomeTitle } from "@/components/HomeTitle";
import { Rule } from "@/components/Ornament";
import { eraPainting, paintingById } from "@/lib/art";
import { fa } from "@/lib/fa";
import { beytTotal, outline, stories, storiesByEra } from "@/lib/shahnameh";

const HERO = 452126; // «Rustam's fourth course», Shahnama of Shah Tahmasp

const thousands = (n: number) => fa(n.toLocaleString("en").replace(/,/g, "٬"));

export default function Home() {
  const eras = storiesByEra();
  const total = stories.reduce((n, s) => n + beytTotal(s), 0);

  return (
    <>
      <div className="relative isolate overflow-hidden">
        {/* Ferdowsi's tomb at Tus, printed in the same single blue ink as the paintings. */}
        <div className="absolute inset-0 -z-10" aria-hidden>
          <div className="duotone absolute inset-0 opacity-25 dark:opacity-35">
            <Image
              src="/home/ferdowsi-tomb.jpg"
              alt=""
              fill
              sizes="100vw"
              loading="eager"
              className="object-cover object-[50%_35%]"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-bg/10 via-bg/40 to-bg" />
        </div>

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <span className="label">شاهنامهٔ فردوسی</span>
          <div className="flex items-center gap-2">
            <FontToggle />
            <ThemeToggle />
          </div>
        </header>

        <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-6 pb-20 sm:px-6 lg:min-h-[78vh] lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
          <div className="flex flex-col items-center gap-10 lg:items-start">
            <HomeTitle />
            <ContinueReading />
            <p className="text-xs tracking-[0.15em] text-ink-soft">
              {fa(stories.length)} داستان · {thousands(total)} بیت
            </p>
          </div>
          <ArtPlate painting={paintingById(HERO)} className="aspect-[2/3]" sizes="(max-width: 1024px) 90vw, 26rem" eager />
        </section>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <div className="mb-14 flex items-end justify-between border-b border-accent pb-4">
          <h2 className="title-font text-2xl leading-[2] text-accent">فهرست</h2>
          <span className="label">پنج دوره · {fa(stories.length)} داستان</span>
        </div>

        {eras.map((era, e) => (
          <section key={era.start} className="mb-20 grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
            <div className="lg:sticky lg:top-8 lg:self-start">
              <p className="text-xs tracking-[0.2em] text-ink-soft">{fa(String(e + 1).padStart(2, "0"))}</p>
              <h3 className="title-font mt-1 text-2xl leading-[2] text-accent">{era.title}</h3>
              <p className="text-sm text-ink-soft">{era.subtitle}</p>
              <div className="mt-5 hidden max-w-36 lg:block">
                <ArtPlate painting={eraPainting(era.start)} className="aspect-[3/4]" sizes="14rem" caption={false} />
              </div>
            </div>

            <ol>
              {era.stories.map((s) => {
                const beyts = beytTotal(s);
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/${s.slug}/1`}
                      className="group grid grid-cols-[2.5rem_minmax(0,1fr)_auto] items-baseline gap-3 border-b border-rule py-4 transition-colors hover:border-accent"
                    >
                      <span className="text-xs text-ink-soft tabular-nums">{fa(String(stories.indexOf(s) + 1).padStart(2, "0"))}</span>
                      <span className="title-font text-lg leading-[2] text-ink transition-transform duration-500 group-hover:-translate-x-1">
                        {s.title}
                      </span>
                      <span className="flex items-center gap-4 text-xs text-ink-soft">
                        <span className="hidden sm:inline">
                          {thousands(beyts)} بیت
                          {s.sections.length > 1 && <> · {fa(s.sections.length)} بخش</>}
                        </span>
                        <span className="sm:hidden">{fa(outline(s).pageCount)} ص</span>
                        <span className="text-accent opacity-0 transition-all duration-500 group-hover:-translate-x-1 group-hover:opacity-100" aria-hidden>
                          ←
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-10 text-center text-xs leading-6 text-ink-soft sm:px-6">
          <Rule className="w-32" />
          <p className="title-font text-base text-accent">بسی رنج بردم در این سال سی · عجم زنده کردم بدین پارسی</p>
          <p>
            متن از{" "}
            <a href="https://ganjoor.net/ferdousi/shahname" className="text-accent underline-offset-4 hover:underline">
              گنجور
            </a>
            {" · "}نگاره‌ها از شاهنامهٔ شاه‌طهماسبی و شاهنامهٔ ایلخانی،{" "}
            <a href="https://www.metmuseum.org/about-the-met/policies-and-documents/open-access" className="text-accent underline-offset-4 hover:underline">
              موزهٔ متروپولیتن
            </a>{" "}
            (مالکیت عمومی)
          </p>
        </div>
      </footer>
    </>
  );
}
