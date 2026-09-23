import { RegisterForm } from "@/components/forms/register-form";
import { GuestGate } from "@/components/providers/guest-gate";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <GuestGate>
      <RegisterForm />
    </GuestGate>
  );
}
