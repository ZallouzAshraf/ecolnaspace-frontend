"use client";

import { Reveal } from "@/components/landing/reveal";
import {
  Eyebrow,
  PageHero,
  PrimaryCta,
  SecondaryCta,
  SectionHeading,
} from "@/components/marketing/primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Baby,
  BookOpen,
  Building2,
  Check,
  Fingerprint,
  Headset,
  Languages,
  LayoutGrid,
  LifeBuoy,
  RefreshCw,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

const FACTORS: Array<{ key: string; icon: LucideIcon; tone: string }> = [
  { key: "size", icon: Users, tone: "from-violet-500 to-indigo-500" },
  { key: "campuses", icon: Building2, tone: "from-sky-500 to-cyan-400" },
  { key: "modules", icon: LayoutGrid, tone: "from-emerald-500 to-teal-400" },
  { key: "support", icon: LifeBuoy, tone: "from-amber-500 to-orange-400" },
];

const MODULES: Array<{ key: string; icon: LucideIcon; featured?: boolean }> = [
  { key: "core", icon: Sparkles, featured: true },
  { key: "earlyYears", icon: Baby },
  { key: "academic", icon: BookOpen },
];

const INCLUDED: Array<{ key: string; icon: LucideIcon }> = [
  { key: "languages", icon: Languages },
  { key: "isolation", icon: ShieldCheck },
  { key: "roles", icon: Fingerprint },
  { key: "hosting", icon: Server },
  { key: "updates", icon: RefreshCw },
  { key: "support", icon: Headset },
];

const FAQ = [
  "calculation",
  "setupFees",
  "tryFirst",
  "changePlan",
  "commitment",
  "dataOnExit",
  "quoteDelay",
] as const;

const STEPS = ["one", "two", "three"] as const;

export function PricingPage() {
  const t = useTranslations("marketing.pricing");

  return (
    <>
      <PageHero eyebrow={t("hero.eyebrow")} title={t("hero.title")} lead={t("hero.lead")}>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <PrimaryCta href={{ pathname: "/contact", query: { topic: "quote" } }}>
            {t("hero.ctaPrimary")}
          </PrimaryCta>
          <SecondaryCta href="/register">{t("hero.ctaSecondary")}</SecondaryCta>
        </div>
        <p className="mt-4 text-sm text-slate-500">{t("hero.note")}</p>
      </PageHero>

      {/* What influences pricing */}
      <section className="relative py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t("factors.eyebrow")}
            title={t("factors.title")}
            body={t("factors.body")}
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {FACTORS.map(({ key, icon: Icon, tone }, i) => (
              <Reveal key={key} delay={i * 70} className="h-full">
                <article className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-36px_rgba(30,27,75,0.3)]">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex size-11 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-[0_10px_20px_-10px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.3)]",
                        tone,
                      )}
                    >
                      <Icon className="size-5" strokeWidth={1.9} aria-hidden />
                    </span>
                    <span className="font-mono text-[11px] font-semibold tabular-nums text-slate-400">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-6 text-base font-semibold tracking-tight text-slate-950">
                    {t(`factors.items.${key}.title`)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
                    {t(`factors.items.${key}.body`)}
                  </p>
                  <p className="mt-5 rounded-xl bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-500">
                    {t(`factors.items.${key}.example`)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="relative border-y border-slate-200/70 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={t("modules.eyebrow")}
            title={t("modules.title")}
            body={t("modules.body")}
          />
          <div className="mt-14 grid gap-4 lg:grid-cols-3 lg:gap-5">
            {MODULES.map(({ key, icon: Icon, featured }, i) => (
              <Reveal key={key} delay={i * 80} className="h-full">
                <article
                  className={cn(
                    "relative flex h-full flex-col rounded-3xl p-7",
                    featured
                      ? "bg-[#0b0a2e] text-white shadow-[0_32px_64px_-32px_rgba(30,27,75,0.7)]"
                      : "border border-slate-200/80 bg-linear-to-b from-white to-slate-50/80",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-xl",
                        featured ? "bg-white/10 text-sky-300 ring-1 ring-white/15" : "bg-primary/10 text-primary",
                      )}
                    >
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                        featured ? "bg-white/10 text-indigo-100" : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {t(`modules.items.${key}.badge`)}
                    </span>
                  </div>
                  <h3
                    className={cn(
                      "mt-6 text-lg font-semibold tracking-tight",
                      featured ? "text-white" : "text-slate-950",
                    )}
                  >
                    {t(`modules.items.${key}.title`)}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed",
                      featured ? "text-indigo-100/75" : "text-slate-600",
                    )}
                  >
                    {t(`modules.items.${key}.body`)}
                  </p>
                  <ul className="mt-6 space-y-2.5">
                    {(t.raw(`modules.items.${key}.features`) as string[]).map((feature) => (
                      <li
                        key={feature}
                        className={cn(
                          "flex items-start gap-2.5 text-sm",
                          featured ? "text-indigo-50" : "text-slate-700",
                        )}
                      >
                        <Check
                          className={cn(
                            "mt-0.5 size-4 shrink-0",
                            featured ? "text-sky-300" : "text-primary",
                          )}
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <p
                    className={cn(
                      "mt-auto pt-7 text-xs",
                      featured ? "text-indigo-200/70" : "text-slate-500",
                    )}
                  >
                    {t(`modules.items.${key}.fit`)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Always included */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8">
          <Reveal>
            <Eyebrow>{t("included.eyebrow")}</Eyebrow>
            <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-4xl sm:leading-[1.1]">
              {t("included.title")}
            </h2>
            <p className="mt-5 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              {t("included.body")}
            </p>
            <div className="mt-8 rounded-2xl border border-primary/15 bg-primary/[0.04] p-5">
              <p className="text-sm font-semibold text-slate-950">{t("start.title")}</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("start.body")}</p>
              <Link
                href="/register"
                className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                {t("start.cta")}
                <ArrowRight
                  className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </div>
          </Reveal>
          <div className="grid gap-3 sm:grid-cols-2">
            {INCLUDED.map(({ key, icon: Icon }, i) => (
              <Reveal key={key} delay={i * 50} className="h-full">
                <div className="flex h-full items-start gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {t(`included.items.${key}.title`)}
                    </p>
                    <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
                      {t(`included.items.${key}.body`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How a quote works */}
      <section className="border-y border-slate-200/70 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={t("process.eyebrow")} title={t("process.title")} />
          <div className="mt-14 grid gap-4 md:grid-cols-3 lg:gap-5">
            {STEPS.map((step, i) => (
              <Reveal key={step} delay={i * 80} className="h-full">
                <div className="relative h-full rounded-3xl border border-slate-200/80 bg-linear-to-b from-white to-slate-50/80 p-7">
                  <span className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-500 text-sm font-semibold text-white shadow-[0_8px_16px_-8px_rgba(99,91,255,0.8)]">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-base font-semibold text-slate-950">
                    {t(`process.steps.${step}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {t(`process.steps.${step}.body`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={t("faq.eyebrow")} title={t("faq.title")} />
          <Reveal className="mt-12">
            <Accordion
              type="single"
              collapsible
              className="rounded-3xl border border-slate-200/80 bg-white px-6 shadow-[0_24px_48px_-40px_rgba(30,27,75,0.35)]"
            >
              {FAQ.map((key) => (
                <AccordionItem key={key} value={key} className="border-slate-200/80">
                  <AccordionTrigger className="py-5 text-[0.95rem] font-semibold text-slate-950 hover:no-underline">
                    {t(`faq.items.${key}.q`)}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-[0.9375rem] leading-relaxed text-slate-600">
                    {t.rich(`faq.items.${key}.a`, {
                      link: (chunks) => (
                        <Link
                          href="/terms"
                          className="font-medium text-indigo-600 underline underline-offset-4 hover:text-indigo-700"
                        >
                          {chunks}
                        </Link>
                      ),
                    })}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-3 pb-16 sm:px-4 sm:pb-20">
        <Reveal>
          <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-[#0b0a2e] px-6 py-16 text-center sm:py-20">
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute start-1/2 top-full h-[32rem] w-[64rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_90deg,rgba(99,91,255,0.6),rgba(56,189,248,0.45),rgba(236,72,153,0.35),rgba(99,91,255,0.6))] blur-[100px] rtl:translate-x-1/2" />
            </div>
            <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
              {t("final.title")}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-indigo-100/80">
              {t("final.body")}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full bg-white px-6 text-[0.95rem] text-slate-950 hover:bg-indigo-50"
              >
                <Link href={{ pathname: "/contact", query: { topic: "quote" } }}>
                  {t("final.ctaPrimary")}
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-[0.95rem] text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/register">{t("final.ctaSecondary")}</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
