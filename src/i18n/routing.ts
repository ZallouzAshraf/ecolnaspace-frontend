import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  localePrefix: "always",
});

export function isRtlLocale(locale: string): boolean {
  return locale === "ar";
}

export function getLocaleDirection(locale: string): "rtl" | "ltr" {
  return isRtlLocale(locale) ? "rtl" : "ltr";
}
