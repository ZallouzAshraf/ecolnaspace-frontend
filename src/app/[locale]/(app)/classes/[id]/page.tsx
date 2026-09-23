import { ClassDetailPage } from "@/components/classes/class-detail-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ClassDetailRoutePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <ClassDetailPage classId={id} />;
}
