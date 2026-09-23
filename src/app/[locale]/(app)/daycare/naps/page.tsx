import { NapsPage } from "@/components/daycare/naps-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NapsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NapsPage />;
}
