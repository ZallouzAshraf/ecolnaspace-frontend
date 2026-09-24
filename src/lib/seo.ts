import { routing } from "@/i18n/routing";
import { SITE, siteUrl } from "@/lib/site-config";
import type { Metadata } from "next";

export const MARKETING_PATHS = [
  "",
  "/pricing",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
] as const;

export type MarketingPath = (typeof MARKETING_PATHS)[number];

const OG_LOCALES: Record<string, string> = {
  fr: "fr_TN",
  en: "en_US",
  ar: "ar_TN",
};

export function localizedAlternates(path: MarketingPath) {
  const base = siteUrl();
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${base}/${locale}${path}`;
  }
  languages["x-default"] = `${base}/${routing.defaultLocale}${path}`;
  return languages;
}

export function buildMarketingMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: string;
  path: MarketingPath;
  title: string;
  description: string;
}): Metadata {
  const url = `${siteUrl()}/${locale}${path}`;
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: url,
      languages: localizedAlternates(path),
    },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      siteName: SITE.name,
      locale: OG_LOCALES[locale] ?? locale,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
