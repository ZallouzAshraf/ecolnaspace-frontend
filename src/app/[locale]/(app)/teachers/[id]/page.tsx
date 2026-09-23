import { TeacherDetailPage } from "@/components/teachers/teacher-detail-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function TeacherDetailRoutePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <TeacherDetailPage teacherId={id} />;
}
