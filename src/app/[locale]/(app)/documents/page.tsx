import { DocumentsPage } from "@/components/documents/documents-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DocumentsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DocumentsPage />;
}
