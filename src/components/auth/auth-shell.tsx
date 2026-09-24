"use client";

import { AuthProductMock } from "@/components/auth/auth-product-mock";
import { BrandMark } from "@/components/landing/brand-mark";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ArrowLeft, Lock, ShieldCheck, Zap, type LucideIcon } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";

const LOCALE_LABELS: Record<AppLocale, string> = {
  fr: "FR",
  en: "EN",
  ar: "ع",
};

const TRUST: Array<{ key: "isolated" | "roles" | "realtime"; icon: LucideIcon }> = [
  { key: "isolated", icon: Lock },
  { key: "roles", icon: ShieldCheck },
  { key: "realtime", icon: Zap },
];

type AuthShellProps = {
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const tLegal = useTranslations("legal");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: AppLocale) {
    router.replace(pathname, { locale: next });
  }

  return (
    <div className="grid h-dvh max-h-dvh overflow-hidden bg-[#fbfbfe] lg:grid-cols-[1.02fr_0.98fr] lg:p-3">
      {/* Brand panel */}
      <aside className="relative isolate hidden overflow-hidden rounded-[1.75rem] bg-[#070a1a] text-slate-100 lg:flex lg:flex-col lg:justify-between lg:px-10 lg:pb-6 lg:pt-8 xl:px-14 xl:pb-7 xl:pt-10">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-48 -start-32 h-[36rem] w-[48rem] motion-safe:animate-[aurora_22s_ease-in-out_infinite]">
            <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_120deg,rgba(99,91,255,0.55),rgba(56,189,248,0.35),rgba(236,72,153,0.25),rgba(99,91,255,0.55))] blur-[100px]" />
          </div>
          <div className="absolute -bottom-40 -end-24 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.22),transparent_65%)]" />
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_70%_60%_at_40%_40%,black,transparent_80%)]" />
          <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
        </div>

        <Link
          href="/"
          className="relative w-fit rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-white/40"
        >
          <BrandMark label={tCommon("appName")} tone="dark" />
        </Link>

        <div className="relative mt-6 mb-3 flex flex-1 flex-col justify-center gap-8">
          <div className="max-w-md motion-safe:animate-[fade-up_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
            <h2 className="text-balance text-[1.55rem] font-semibold leading-[1.15] tracking-[-0.03em] text-white xl:text-[1.85rem]">
              {t("brandPanel.headline")}
            </h2>
            <p className="mt-3 max-w-sm text-[0.9rem] leading-relaxed text-slate-400">
              {t("brandPanel.body")}
            </p>
          </div>

          <div className="motion-safe:animate-[fade-up_1.1s_0.15s_cubic-bezier(0.22,1,0.36,1)_both]">
            <AuthProductMock />
          </div>

          <ul className="grid max-w-lg gap-2.5 sm:grid-cols-3">
            {TRUST.map(({ key, icon: Icon }) => (
              <li
                key={key}
                className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 backdrop-blur-sm"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.07] ring-1 ring-white/10">
                  <Icon className="size-3.5 text-sky-300" aria-hidden />
                </span>
                <p className="text-[11px] font-medium leading-snug text-slate-200">
                  {t(`brandPanel.trust.${key}`)}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative flex items-center gap-2 text-[11px] text-slate-500">
          <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />
          {t("brandPanel.footer")}
        </p>
      </aside>

      {/* Form side */}
      <div className="relative isolate flex min-h-0 flex-col overflow-hidden px-4 py-3 sm:px-8 lg:px-10 lg:py-4 xl:px-14">
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 start-1/2 h-[26rem] w-[40rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,91,255,0.14),transparent_65%)] rtl:translate-x-1/2" />
          <div className="absolute inset-0 [background-image:radial-gradient(rgba(15,23,42,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_45%_at_50%_0%,black,transparent_75%)]" />
        </div>

        <div className="relative z-10 flex shrink-0 items-center justify-between gap-3">
          <Link
            href="/"
            className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 lg:hidden"
          >
            <BrandMark label={tCommon("appName")} />
          </Link>
          <Link
            href="/"
            className="group hidden items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-slate-900/[0.04] hover:text-slate-900 lg:inline-flex"
          >
            <ArrowLeft
              className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"
              aria-hidden
            />
            {tLegal("back")}
          </Link>
          <div
            className="flex items-center gap-0.5 rounded-full border border-slate-200/80 bg-white/80 p-0.5 shadow-sm backdrop-blur"
            role="group"
            aria-label={t("language")}
          >
            {locales.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLocale(code)}
                className={cn(
                  "min-w-7 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
                  code === locale
                    ? "bg-slate-900 text-white"
                    : "text-slate-500 hover:text-slate-900",
                )}
                aria-current={code === locale ? "true" : undefined}
              >
                {LOCALE_LABELS[code]}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto flex min-h-0 w-full max-w-[440px] flex-1 flex-col justify-center overflow-hidden py-1 sm:py-2">
          <div className="auth-card relative max-h-full overflow-hidden rounded-[1.5rem] border border-white/80 bg-white/75 p-4 shadow-[0_40px_80px_-40px_rgba(30,27,75,0.35),0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-900/5 backdrop-blur-xl motion-safe:animate-[fade-up_0.7s_cubic-bezier(0.22,1,0.36,1)_both] sm:rounded-[1.75rem] sm:p-5">
            <div
              aria-hidden
              className="absolute inset-x-10 -top-px h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
            />
            {children}
          </div>
        </div>

        <p className="shrink-0 py-1 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} {tCommon("appName")}
        </p>
      </div>
    </div>
  );
}
