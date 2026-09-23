import { CampusesPage } from "@/components/campuses/campuses-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function CampusesRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CampusesPage />;
}
