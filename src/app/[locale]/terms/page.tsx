import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function TermsPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">{t("termsTitle")}</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        {t("termsBody")}
      </p>
      <Link
        href="/"
        className="mt-8 inline-block text-sm font-medium text-primary hover:underline"
      >
        {t("back")}
      </Link>
    </main>
  );
}
