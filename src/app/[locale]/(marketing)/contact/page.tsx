import { ContactPage } from "@/components/marketing/contact-page";
import type { ContactTopic } from "@/components/marketing/contact-form";
import { buildMarketingMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ topic?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "marketing.contact.meta" });
  return buildMarketingMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("description"),
  });
}

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { topic } = await searchParams;
  const resolved: ContactTopic = topic === "demo" || topic === "quote" ? topic : "general";
  return <ContactPage key={resolved} topic={resolved} />;
}
