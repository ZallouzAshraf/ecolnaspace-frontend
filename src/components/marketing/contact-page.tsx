"use client";

import { Reveal } from "@/components/landing/reveal";
import { ContactForm, type ContactTopic } from "@/components/marketing/contact-form";
import { PageHero } from "@/components/marketing/primitives";
import { Link } from "@/i18n/navigation";
import { SITE } from "@/lib/site-config";
import { ArrowRight, Clock, Lock, Mail, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const STEPS = ["one", "two", "three"] as const;

export function ContactPage({ topic }: { topic: ContactTopic }) {
  const t = useTranslations("marketing.contact");

  return (
    <>
      <PageHero
        compact
        eyebrow={t("hero.eyebrow")}
        title={t(`hero.title.${topic}`)}
        lead={t("hero.lead")}
      />

      <section className="pb-20 sm:pb-24">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.45fr_1fr] lg:gap-8 lg:px-8">
          <Reveal>
            <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_40px_80px_-48px_rgba(30,27,75,0.4)] sm:p-8">
              <h2 className="text-lg font-semibold tracking-tight text-slate-950">
                {t(`formTitle.${topic}`)}
              </h2>
              <p className="mt-1.5 text-sm text-slate-500">{t("formSubtitle")}</p>
              <div className="mt-7">
                <ContactForm topic={topic} />
              </div>
            </div>
          </Reveal>

          <div className="flex flex-col gap-6">
            <Reveal delay={80}>
              <aside className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 sm:p-7">
                <h2 className="text-sm font-semibold text-slate-950">{t("direct.title")}</h2>
                <ul className="mt-5 space-y-4 text-sm">
                  <ContactLine icon={Mail} label={t("direct.email")}>
                    <a
                      href={`mailto:${SITE.contactEmail}`}
                      dir="ltr"
                      className="font-medium text-slate-900 hover:text-primary"
                    >
                      {SITE.contactEmail}
                    </a>
                  </ContactLine>
                  <ContactLine icon={Lock} label={t("direct.privacy")}>
                    <a
                      href={`mailto:${SITE.privacyEmail}`}
                      dir="ltr"
                      className="font-medium text-slate-900 hover:text-primary"
                    >
                      {SITE.privacyEmail}
                    </a>
                  </ContactLine>
                  {SITE.phone ? (
                    <ContactLine icon={Phone} label={t("direct.phone")}>
                      <a
                        href={`tel:${SITE.phone.replace(/\s+/g, "")}`}
                        dir="ltr"
                        className="font-medium text-slate-900 hover:text-primary"
                      >
                        {SITE.phone}
                      </a>
                    </ContactLine>
                  ) : null}
                  <ContactLine icon={MapPin} label={t("direct.location")}>
                    <span className="font-medium text-slate-900">
                      {SITE.city ? `${SITE.city}, ${t("direct.country")}` : t("direct.country")}
                    </span>
                  </ContactLine>
                  <ContactLine icon={Clock} label={t("direct.response")}>
                    <span className="text-slate-700">{t("direct.responseValue")}</span>
                  </ContactLine>
                </ul>
              </aside>
            </Reveal>

            <Reveal delay={140}>
              <aside className="rounded-[1.75rem] bg-[#0b0a2e] p-6 text-white sm:p-7">
                <h2 className="text-sm font-semibold">{t("next.title")}</h2>
                <ol className="mt-5 space-y-5">
                  {STEPS.map((step, i) => (
                    <li key={step} className="flex gap-3.5">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-sky-200 ring-1 ring-white/15">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-sm font-medium">{t(`next.steps.${step}.title`)}</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-indigo-100/70">
                          {t(`next.steps.${step}.body`)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </aside>
            </Reveal>

            <Reveal delay={200}>
              <div className="rounded-[1.75rem] border border-slate-200/80 bg-white p-6 sm:p-7">
                <p className="text-sm font-semibold text-slate-950">{t("selfServe.title")}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{t("selfServe.body")}</p>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  <InlineLink href="/register">{t("selfServe.register")}</InlineLink>
                  <InlineLink href="/pricing">{t("selfServe.pricing")}</InlineLink>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

function ContactLine({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Icon className="size-4" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500">{label}</p>
        <div className="mt-0.5 break-words">{children}</div>
      </div>
    </li>
  );
}

function InlineLink({ href, children }: { href: "/register" | "/pricing"; children: ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-1 text-sm font-semibold text-primary">
      {children}
      <ArrowRight
        className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
