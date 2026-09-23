import { TeachersPage } from "@/components/teachers/teachers-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TeachersRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TeachersPage />;
}
