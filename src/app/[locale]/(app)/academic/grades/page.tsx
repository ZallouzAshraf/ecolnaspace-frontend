import { GradesPage } from "@/components/academic/grades-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GradesRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <GradesPage />;
}
