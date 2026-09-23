import { LoginForm } from "@/components/forms/login-form";
import { GuestGate } from "@/components/providers/guest-gate";
import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <GuestGate>
      <Suspense>
        <LoginForm />
      </Suspense>
    </GuestGate>
  );
}
