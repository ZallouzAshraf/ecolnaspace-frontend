import { InvoiceDetailPage } from "@/components/finance/invoice-detail-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function InvoiceDetailRoutePage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <InvoiceDetailPage invoiceId={id} />;
}
