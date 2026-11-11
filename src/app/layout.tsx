import type { Metadata, Viewport } from "next";
import { Noto_Nastaliq_Urdu, Vazirmatn } from "next/font/google";
import { Providers } from "@/components/Providers";
import { PREFERENCES_SCRIPT } from "@/lib/preferences-script";
import "./globals.css";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic", "latin"],
  display: "swap",
});

const nastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "شاهنامه — حکیم ابوالقاسم فردوسی",
    template: "%s | شاهنامه",
  },
  description: "خوانش شاهنامهٔ فردوسی، با خط نستعلیق و خط ساده، در حالت روز و شب.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#060c2a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={`${vazir.variable} ${nastaliq.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFERENCES_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <div className="relative z-10 flex min-h-full flex-1 flex-col">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
