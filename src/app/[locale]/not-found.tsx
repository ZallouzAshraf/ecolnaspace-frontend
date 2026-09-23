import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("common");

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t("noResults")}</h1>
      <Link href="/dashboard" className="text-sm text-primary hover:underline">
        {t("appName")}
      </Link>
    </div>
  );
}
