import { StudentsPage } from "@/components/students/students-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function StudentsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <StudentsPage />;
}
