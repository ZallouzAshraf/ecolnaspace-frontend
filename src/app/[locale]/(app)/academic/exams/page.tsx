import { ExamsPage } from "@/components/academic/exams-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ExamsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ExamsPage />;
}
