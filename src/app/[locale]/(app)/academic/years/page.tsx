import { AcademicYearsPage } from "@/components/academic/academic-years-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AcademicYearsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AcademicYearsPage />;
}
