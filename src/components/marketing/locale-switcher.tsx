"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { rememberLocale } from "@/lib/consent";
import { cn } from "@/lib/utils";
import { Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const LOCALE_NAMES: Record<AppLocale, string> = {
  fr: "Français",
  en: "English",
  ar: "العربية",
};

export function LocaleSwitcher({ className }: { className?: string }) {
  const t = useTranslations("marketing.footer");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: AppLocale) {
    rememberLocale(next);
    router.replace(pathname, { locale: next });
  }

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn("flex flex-wrap items-center gap-1.5", className)}
    >
      <Globe className="me-1 size-4 text-slate-400" aria-hidden />
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => switchLocale(code)}
          aria-current={code === locale ? "true" : undefined}
          className={cn(
            "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
            code === locale
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900",
          )}
        >
          {LOCALE_NAMES[code]}
        </button>
      ))}
    </div>
  );
}
