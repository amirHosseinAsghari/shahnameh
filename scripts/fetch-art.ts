// Downloads public-domain Shahnameh paintings from The Met's Open Access collection
// into public/art/ and writes src/data/art.json.
// Usage: npx tsx scripts/fetch-art.ts   (resumable — downloaded images are skipped)
import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const API = "https://collectionapi.metmuseum.org/public/collection/v1/objects";
const OUT = path.join(process.cwd(), "public", "art");
const MANIFEST = path.join(process.cwd(), "src", "data", "art.json");
const HEIGHT = 1600;

const TAHMASP = "شاهنامهٔ شاه‌طهماسبی، تبریز، حدود ۹۳۱–۹۴۱ ق";
const ILKHANID = "شاهنامهٔ ایلخانی، حدود ۷۳۰–۷۴۰ ق";

// Each painting, the stories it illustrates, and its Persian caption.
const PAINTINGS: { id: number; stories: string[]; title: string; folio?: string; manuscript?: string }[] = [
  { id: 452110, stories: ["aghaz"], title: "تمثیل کشتی در دیباچهٔ فردوسی", folio: "برگ ۱۸ پشت" },
  { id: 452111, stories: ["qmars", "hushang"], title: "جشن سده", folio: "برگ ۲۲ پشت" },
  { id: 452112, stories: ["tahmoores"], title: "پیروزی طهمورث بر دیوان", folio: "برگ ۲۳ پشت" },
  { id: 452113, stories: ["jamshid", "zahak"], title: "ضحاک از سرنوشت خویش آگاه می‌شود", folio: "برگ ۲۹ پشت" },
  { id: 452114, stories: ["fereydoon"], title: "فریدون منوچهر را در آغوش می‌گیرد", folio: "برگ ۵۹ پشت" },
  { id: 452115, stories: ["manoochehr"], title: "بازگشت کنیزان رودابه به کاخ", folio: "برگ ۷۱ پشت" },
  { id: 452117, stories: ["manoochehr"], title: "زال با موبدان رای می‌زند", folio: "برگ ۷۳ پشت" },
  { id: 452118, stories: ["manoochehr"], title: "منوچهر سام را می‌پذیرد و فرمان جنگ با مهراب می‌دهد", folio: "برگ ۸۰ پشت" },
  { id: 452120, stories: ["manoochehr"], title: "خشم مهراب بر سیندخت", folio: "برگ ۸۳ پشت" },
  { id: 452121, stories: ["manoochehr"], title: "پیمان سام با سیندخت", folio: "برگ ۸۵ پشت" },
  { id: 452122, stories: ["manoochehr"], title: "موبدان شاه پیوند زال را می‌پسندند", folio: "برگ ۸۶ پشت" },
  { id: 452123, stories: ["manoochehr"], title: "زال رازهای موبدان را می‌گشاید", folio: "برگ ۸۷ پشت" },
  { id: 452124, stories: ["nozar"], title: "زال خزروان را از پای درمی‌آورد", folio: "برگ ۱۰۴ رو" },
  { id: 452125, stories: ["zutahmasb", "garshasp"], title: "افراسیاب بر تخت ایران", folio: "برگ ۱۰۵ رو" },
  { id: 452126, stories: ["kkavoos"], title: "خوان چهارم رستم: کشتن زن جادو", folio: "برگ ۱۲۰ پشت" },
  { id: 452127, stories: ["kkavoos"], title: "کاووس و رستم یکدیگر را در آغوش می‌گیرند", folio: "برگ ۱۲۳ رو" },
  { id: 452130, stories: ["hamavaran"], title: "پرواز کاووس به آسمان", folio: "برگ ۱۳۴ رو" },
  { id: 452131, stories: ["sohrab"], title: "رستمِ دردمند در برابر کاووس", folio: "برگ ۱۴۶ رو" },
  { id: 452134, stories: ["siavosh"], title: "نامهٔ نکوهش کاووس به سیاوش", folio: "برگ ۱۷۴ رو" },
  { id: 452135, stories: ["siavosh"], title: "چوگان‌بازی سیاوش در برابر افراسیاب", folio: "برگ ۱۸۰ پشت" },
  { id: 452137, stories: ["siavosh"], title: "عروسی سیاوش و فرنگیس", folio: "برگ ۱۸۵ پشت" },
  { id: 452138, stories: ["siavosh"], title: "سیاوش خواب خود را برای فرنگیس بازمی‌گوید", folio: "برگ ۱۹۵ رو" },
  { id: 452141, stories: ["kkhosro"], title: "گیو کیخسرو را می‌یابد", folio: "برگ ۲۱۰ پشت" },
  { id: 452143, stories: ["forood"], title: "پیمان بر سر غنیمت‌های کیخسرو", folio: "برگ ۲۲۵ پشت" },
  { id: 452144, stories: ["forood"], title: "سوگ ایرانیان بر فرود و جریره", folio: "برگ ۲۳۶ رو" },
  { id: 452146, stories: ["forood"], title: "آغاز نبرد پشن", folio: "برگ ۲۴۳ پشت" },
  { id: 452148, stories: ["forood"], title: "گیو کین بهرام را از تژاو می‌ستاند", folio: "برگ ۲۴۸ رو" },
  { id: 452149, stories: ["kamoos", "khaghan", "akvan"], title: "نبرد رستم و اشکبوس", folio: "برگ ۲۶۸ پشت" },
  { id: 452151, stories: ["bizhan"], title: "دایهٔ منیژه بیژن را به بزم فرامی‌خواند", folio: "برگ ۳۰۰ پشت" },
  { id: 452156, stories: ["12rokh"], title: "گستهم لهاک و فرشیدورد را می‌کشد", folio: "برگ ۳۴۹ پشت" },
  { id: 452157, stories: ["mahmood"], title: "نبرد شبانهٔ کیخسرو و افراسیاب", folio: "برگ ۳۶۷ پشت" },
  { id: 452158, stories: ["mahmood"], title: "پیروزی کیخسرو بر سپاه مکران", folio: "برگ ۳۷۶ پشت" },
  { id: 452159, stories: ["lohrasp", "goshtasp"], title: "هنرنمایی گشتاسپ در تیراندازی نزد قیصر", folio: "برگ ۴۰۴ رو" },
  { id: 452163, stories: ["7esfandyar", "esfandyar"], title: "آغاز نبرد رستم و اسفندیار", folio: "برگ ۴۶۱ پشت" },
  { id: 452164, stories: ["esfandyar"], title: "رستم اسفندیار را از پای درمی‌آورد", folio: "برگ ۴۶۶ رو" },
  { id: 452165, stories: ["shqad"], title: "رستم پیش از مرگ کین خود را می‌ستاند", folio: "برگ ۴۷۲ رو" },
  { id: 452166, stories: ["bahman", "homa"], title: "فرامرز در نبرد با بهمن در میان دشمن", folio: "برگ ۴۷۵ رو" },
  { id: 452657, stories: ["eskandar", "darab", "dara"], title: "اسکندر در میان برهمنان", manuscript: ILKHANID },
  { id: 452659, stories: ["eskandar", "ashkanian"], title: "سوگ اسکندر", manuscript: ILKHANID },
  { id: 452168, stories: ["zolaktaf", "ardeshir", "shapoor"], title: "تاج‌گذاری شاپورِ خردسال", folio: "برگ ۵۳۸ رو" },
  { id: 452169, stories: ["zolaktaf"], title: "قیصر در بند شاپور", folio: "برگ ۵۴۳ رو" },
  { id: 452171, stories: ["bahgoor"], title: "بهرام گور دو گور را با یک تیر به هم می‌دوزد", folio: "برگ ۵۶۸ رو" },
  { id: 452173, stories: ["bahgoor"], title: "خاقان در بند بهرام گور", folio: "برگ ۵۷۸ رو" },
  { id: 452174, stories: ["bahgoor"], title: "بهرام گور کرگ را می‌کشد", folio: "برگ ۵۸۶ رو" },
  { id: 452175, stories: ["yazdgerd", "bezehgar"], title: "بر تخت نشستن یزدگرد", folio: "برگ ۵۹۲ رو" },
  { id: 452176, stories: ["qobad"], title: "پیروزی سوفزای بر هیتالیان", folio: "برگ ۵۹۵ پشت" },
  { id: 452177, stories: ["anooshirvan"], title: "نوشین‌روان آیین داد را می‌گستراند", folio: "برگ ۶۰۲ پشت" },
  { id: 452178, stories: ["anooshirvan"], title: "بزرگمهر در بزم پنجم نوشین‌روان", folio: "برگ ۶۲۲ رو" },
  { id: 452179, stories: ["anooshirvan"], title: "نوشین‌روان دختر خاقان را می‌پذیرد", folio: "برگ ۶۳۳ پشت" },
  { id: 452180, stories: ["anooshirvan"], title: "بزرگمهر راز شطرنج هندی را می‌گشاید", folio: "برگ ۶۳۹ پشت" },
  { id: 452181, stories: ["hormozd", "parviz"], title: "یورش خسروپرویز بر بهرام چوبینه", folio: "برگ ۷۰۷ پشت" },
  { id: 452183, stories: ["parviz"], title: "بهرام چوبینه دیو شیرکپی را می‌کشد", folio: "برگ ۷۱۵ پشت" },
  { id: 452184, stories: ["shirooye"], title: "کشته شدن خسروپرویز", folio: "برگ ۷۴۲ پشت" },
  { id: 452185, stories: ["ardeshiroo", "farayeen", "pooran", "azarmdokht", "farrokh", "yazdgerd3"], title: "شورش بر شاهِ غاصب", folio: "برگ ۷۴۵ پشت" },
];

type MetObject = { isPublicDomain: boolean; primaryImage: string; title: string; objectURL: string };

async function get(url: string, tries = 4): Promise<Response> {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return res;
    } catch (err) {
      if (i >= tries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * i));
    }
  }
}

const exists = (p: string) => access(p).then(() => true, () => false);

async function main() {
  await mkdir(OUT, { recursive: true });
  const manifest = [];

  for (const p of PAINTINGS) {
    const obj = (await (await get(`${API}/${p.id}`)).json()) as MetObject;
    if (!obj.isPublicDomain || !obj.primaryImage) {
      console.warn(`✗ ${p.id} is not public domain — skipped`);
      continue;
    }
    const file = path.join(OUT, `${p.id}.jpg`);
    if (!(await exists(file))) {
      const original = Buffer.from(await (await get(obj.primaryImage)).arrayBuffer());
      await sharp(original).resize({ height: HEIGHT, withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(file);
      console.log(`↓ ${p.id} ${obj.title.slice(0, 60)}`);
    }
    const { width, height } = await sharp(file).metadata();
    manifest.push({
      id: p.id,
      src: `/art/${p.id}.jpg`,
      width,
      height,
      stories: p.stories,
      title: p.title,
      folio: p.folio ?? null,
      manuscript: p.manuscript ?? TAHMASP,
      source: obj.objectURL,
    });
  }

  await writeFile(MANIFEST, JSON.stringify(manifest, null, 1));
  console.log(`Done: ${manifest.length} paintings`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
