import { SubjectsPage } from "@/components/academic/subjects-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SubjectsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SubjectsPage />;
}
