import { MessagesPage } from "@/components/communication/messages-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function MessagesRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MessagesPage />;
}
