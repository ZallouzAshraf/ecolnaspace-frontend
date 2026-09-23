import { ActivitiesPage } from "@/components/daycare/activities-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ActivitiesRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ActivitiesPage />;
}
