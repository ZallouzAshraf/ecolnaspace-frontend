import { InvoicesPage } from "@/components/finance/invoices-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function InvoicesRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <InvoicesPage />;
}
