import { AnnouncementsPage } from "@/components/communication/announcements-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AnnouncementsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AnnouncementsPage />;
}
