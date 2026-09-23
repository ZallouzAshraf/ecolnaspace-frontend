import { ParentsPage } from "@/components/parents/parents-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ParentsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ParentsPage />;
}
