import { PricingPage } from "@/components/marketing/pricing-page";
import { buildMarketingMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing.pricing.meta" });
  return buildMarketingMetadata({
    locale,
    path: "/pricing",
    title: t("title"),
    description: t("description"),
  });
}

export default async function Page({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PricingPage />;
}
