import { SchedulesPage } from "@/components/academic/schedules-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SchedulesRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SchedulesPage />;
}
