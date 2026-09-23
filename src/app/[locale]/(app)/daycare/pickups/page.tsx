import { PickupsPage } from "@/components/daycare/pickups-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PickupsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PickupsPage />;
}
