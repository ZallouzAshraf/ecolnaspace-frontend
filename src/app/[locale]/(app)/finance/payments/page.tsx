import { PaymentsPage } from "@/components/finance/payments-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PaymentsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PaymentsPage />;
}
