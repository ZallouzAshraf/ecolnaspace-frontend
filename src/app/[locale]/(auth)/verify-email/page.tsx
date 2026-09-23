import { VerifyEmailPanel } from "@/components/forms/verify-email-panel";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function VerifyEmailPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense>
      <VerifyEmailPanel />
    </Suspense>
  );
}
