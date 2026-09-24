import { routing } from "@/i18n/routing";
import { localizedAlternates, MARKETING_PATHS } from "@/lib/seo";
import { siteUrl } from "@/lib/site-config";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return MARKETING_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      changeFrequency: path === "" || path === "/pricing" ? "weekly" : "monthly",
      priority: path === "" ? 1 : path === "/pricing" || path === "/contact" ? 0.8 : 0.5,
      alternates: { languages: localizedAlternates(path) },
    })),
  );
}
