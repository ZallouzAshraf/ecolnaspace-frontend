import { getLocaleDirection, routing } from "@/i18n/routing";
import { Geist, Noto_Sans_Arabic } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const notoArabic = Noto_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
});

/** Global unmatched URL fallback (Next.js 16 + nested root layout). */
export default function GlobalNotFound() {
  const locale = routing.defaultLocale;
  const direction = getLocaleDirection(locale);

  return (
    <html
      lang={locale}
      dir={direction}
      className={`${geistSans.variable} ${notoArabic.variable} h-full`}
    >
      <body className="flex min-h-full flex-col items-center justify-center bg-background px-6 font-sans text-foreground antialiased">
        <p className="text-2xl font-semibold tracking-tight">404</p>
        <p className="mt-2 text-sm text-muted-foreground">Page not found</p>
        <a
          href={`/${locale}`}
          className="mt-6 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          EcolnaSpace
        </a>
      </body>
    </html>
  );
}
