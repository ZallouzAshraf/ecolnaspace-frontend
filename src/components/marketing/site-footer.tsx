"use client";

import { BrandMark } from "@/components/landing/brand-mark";
import { LocaleSwitcher } from "@/components/marketing/locale-switcher";
import { Link } from "@/i18n/navigation";
import { openConsentPreferences } from "@/lib/consent";
import { SITE } from "@/lib/site-config";
import { Mail, MapPin, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";

type FooterHref = ComponentProps<typeof Link>["href"];

export function SiteFooter() {
  const t = useTranslations("marketing.footer");
  const tNav = useTranslations("landing.nav");
  const year = new Date().getFullYear();

  const columns: Array<{
    title: string;
    links: Array<{ href: FooterHref; label: string }>;
  }> = [
    {
      title: t("columns.product"),
      links: [
        { href: { pathname: "/", hash: "product" }, label: t("links.features") },
        { href: "/pricing", label: t("links.pricing") },
        { href: "/register", label: t("links.getStarted") },
        { href: "/login", label: tNav("signIn") },
      ],
    },
    {
      title: t("columns.resources"),
      links: [
        { href: "/contact", label: t("links.contact") },
        { href: { pathname: "/contact", query: { topic: "demo" } }, label: t("links.demo") },
        { href: { pathname: "/contact", query: { topic: "quote" } }, label: t("links.quote") },
      ],
    },
    {
      title: t("columns.legal"),
      links: [
        { href: "/privacy", label: t("links.privacy") },
        { href: "/terms", label: t("links.terms") },
        { href: "/cookies", label: t("links.cookies") },
      ],
    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-slate-200/80 bg-[#f3f4fa]">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-12 sm:px-6 lg:grid-cols-[1.4fr_2fr] lg:gap-16 lg:px-8">
        <div className="max-w-sm">
          <Link
            href="/"
            className="inline-flex rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <BrandMark label={SITE.name} />
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {t("blurb")}
          </p>
          <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden />
              <span>{t("trust")}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
              <a
                href={`mailto:${SITE.contactEmail}`}
                dir="ltr"
                className="transition-colors hover:text-slate-950"
              >
                {SITE.contactEmail}
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" aria-hidden />
              <span>{SITE.city ? `${SITE.city}, ${t("country")}` : t("country")}</span>
            </li>
          </ul>
          <LocaleSwitcher className="mt-7" />
        </div>

        <nav
          aria-label={t("navLabel")}
          className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3"
        >
          {columns.map((column) => (
            <FooterColumn key={column.title} title={column.title}>
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-slate-950"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {column.title === t("columns.legal") ? (
                <li>
                  <button
                    type="button"
                    onClick={openConsentPreferences}
                    className="text-start transition-colors hover:text-slate-950"
                  >
                    {t("links.cookieSettings")}
                  </button>
                </li>
              ) : null}
            </FooterColumn>
          ))}
        </nav>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 border-t border-slate-200/80 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name} · {t("country")}
            {SITE.legalEntity ? ` · ${SITE.legalEntity}` : ""}
            {SITE.registrationNumber ? ` · ${t("registration", { number: SITE.registrationNumber })}` : ""}
            {" · "}
            {t("rights")}
          </p>
          <p className="flex items-center gap-1.5" dir="ltr">
            <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden />
            {SITE.appHost}
          </p>
        </div>
      </div>
      <p
        aria-hidden
        dir="ltr"
        className="pointer-events-none -mb-[0.22em] select-none text-center text-[clamp(4rem,17vw,15rem)] leading-none font-semibold tracking-[-0.06em] text-transparent [background-clip:text] [-webkit-background-clip:text] bg-linear-to-b from-slate-300/70 to-[#f3f4fa]"
      >
        {SITE.name}
      </p>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-slate-600">{children}</ul>
    </div>
  );
}
