import { NotificationsPage } from "@/components/communication/notifications-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NotificationsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <NotificationsPage />;
}
