import { MealsPage } from "@/components/daycare/meals-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MealsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MealsPage />;
}
