import { LegalDocument } from "@/components/marketing/legal-document";
import { loadLegalDoc, type LegalDocKey } from "@/lib/legal";
import { buildMarketingMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

type Params = { params: Promise<{ locale: string }> };

/** Shared generateMetadata + page for the three legal routes. */
export function createLegalRoute(docKey: LegalDocKey) {
  async function generateMetadata({ params }: Params): Promise<Metadata> {
    const { locale } = await params;
    const doc = await loadLegalDoc(locale, docKey);
    return buildMarketingMetadata({
      locale,
      path: `/${docKey}`,
      title: doc.metaTitle,
      description: doc.metaDescription,
    });
  }

  async function Page({ params }: Params) {
    const { locale } = await params;
    setRequestLocale(locale);
    const doc = await loadLegalDoc(locale, docKey);
    return <LegalDocument docKey={docKey} doc={doc} locale={locale} />;
  }

  return { generateMetadata, Page };
}
