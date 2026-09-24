import { routing } from "@/i18n/routing";
import { hasLocale } from "next-intl";

export type LegalDocKey = "privacy" | "terms" | "cookies";

export type LegalBlock =
  | { p: string }
  | { h: string }
  | { ul: string[] }
  | { note: string }
  | { table: { head: string[]; rows: string[][] } };

export type LegalSection = {
  id: string;
  title: string;
  blocks: LegalBlock[];
};

export type LegalDoc = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  lead: string;
  summary: { title: string; items: string[] };
  sections: LegalSection[];
};

/** Loaded on the server only, so legal copy never ships in the client message bundle. */
export async function loadLegalDoc(locale: string, doc: LegalDocKey): Promise<LegalDoc> {
  const safeLocale = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const all = (await import(`../../messages/legal/${safeLocale}.json`)).default as Record<
    LegalDocKey,
    LegalDoc
  >;
  return all[doc];
}
