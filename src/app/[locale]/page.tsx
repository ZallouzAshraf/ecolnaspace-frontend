import { LandingPage } from "@/components/landing/landing-page";
import { routing } from "@/i18n/routing";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "landing" });
  const title = t("meta.title");
  const description = t("meta.description");
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        fr: `${base}/fr`,
        en: `${base}/en`,
        ar: `${base}/ar`,
      },
    },
    openGraph: {
      title,
      description,
      locale,
      type: "website",
      url: `${base}/${locale}`,
      siteName: "EcolnaSpace",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function JsonLd({
  locale,
  description,
}: {
  locale: string;
  description: string;
}) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "EcolnaSpace",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description,
    url: `${base}/${locale}`,
    inLanguage: locale,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "MAD",
      description: "Talk to us for pricing",
    },
    publisher: {
      "@type": "Organization",
      name: "EcolnaSpace",
      url: base,
      email: "contact@ecolnaspace.com",
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
