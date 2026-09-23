import { StudentDetailPage } from "@/components/students/student-detail-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function StudentDetailRoutePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <StudentDetailPage studentId={id} />;
}
