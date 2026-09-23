import { SettingsPage } from "@/components/settings/settings-page";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SettingsRoutePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SettingsPage />;
}
