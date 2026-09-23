import { ParentDetailPage } from "@/components/parents/parent-detail-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ParentDetailRoutePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <ParentDetailPage parentId={id} />;
}
