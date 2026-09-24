import { LandingPage } from "@/components/landing/landing-page";
import { routing } from "@/i18n/routing";
import { buildMarketingMetadata } from "@/lib/seo";
import { SITE, siteUrl } from "@/lib/site-config";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  return buildMarketingMetadata({
    locale,
    path: "",
    title: t("meta.title"),
    description: t("meta.description"),
  });
}

function JsonLd({
  locale,
  description,
}: {
  locale: string;
  description: string;
}) {
  const base = siteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE.name,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    url: `${base}/${locale}`,
    inLanguage: locale,
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: base,
      email: SITE.contactEmail,
      address: { "@type": "PostalAddress", addressCountry: SITE.country },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "landing" });

  return (
    <>
      <JsonLd locale={locale} description={t("meta.description")} />
      <LandingPage />
    </>
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
