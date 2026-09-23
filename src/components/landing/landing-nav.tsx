"use client";

import { BrandMark } from "@/components/landing/brand-mark";
import { Button } from "@/components/ui/button";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { ArrowRight, Menu, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const LOCALE_LABELS: Record<AppLocale, string> = {
  fr: "FR",
  en: "EN",
  ar: "ع",
};

export function LandingNav() {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  function switchLocale(next: AppLocale) {
    router.replace(pathname, { locale: next });
  }

  const links = [
    { href: "#product" as const, label: t("nav.product") },
    { href: "#pricing" as const, label: t("nav.pricing") },
    { href: "#contact" as const, label: t("nav.contact") },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-4">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 rounded-2xl border px-3 transition-[background-color,border-color,box-shadow,max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-4",
          scrolled
            ? "max-w-5xl border-white/60 bg-white/70 shadow-[0_12px_40px_-16px_rgba(15,23,42,0.22),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-2xl backdrop-saturate-150"
            : "border-transparent bg-transparent",
        )}
      >
        <Link href="/" className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <BrandMark label={tCommon("appName")} />
        </Link>

        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label={t("nav.primary")}
        >
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-slate-900/[0.04] hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <div
            className="flex items-center gap-0.5 rounded-full border border-border/80 bg-white/70 p-0.5 shadow-sm"
            role="group"
            aria-label={t("nav.language")}
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
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={code === locale ? "true" : undefined}
              >
                {LOCALE_LABELS[code]}
              </button>
            ))}
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full">
            <Link href="/login">{t("nav.signIn")}</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="group rounded-full bg-slate-900 px-3.5 text-white shadow-[0_6px_16px_-6px_rgba(15,23,42,0.6)] hover:bg-slate-800"
          >
            <Link href="/register">
              {t("nav.cta")}
              <ArrowRight
                className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                aria-hidden
              />
            </Link>
          </Button>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full md:hidden"
          aria-expanded={open}
          aria-controls="landing-mobile-nav"
          aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </Button>
      </div>

      {open && (
        <div
          id="landing-mobile-nav"
          className="mx-auto mt-2 max-w-6xl rounded-2xl border border-border/70 bg-white/90 p-4 shadow-[0_20px_50px_-20px_rgba(15,23,42,0.3)] backdrop-blur-2xl md:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label={t("nav.primary")}>
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-2 py-2 text-sm font-medium text-foreground hover:bg-muted"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/70 pt-3">
            {locales.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => switchLocale(code)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  code === locale
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-border text-muted-foreground",
                )}
              >
                {LOCALE_LABELS[code]}
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild variant="outline" className="w-full rounded-full">
              <Link href="/login">{t("nav.signIn")}</Link>
            </Button>
            <Button
              asChild
              className="w-full rounded-full bg-slate-900 text-white hover:bg-slate-800"
            >
              <Link href="/register">{t("nav.cta")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
