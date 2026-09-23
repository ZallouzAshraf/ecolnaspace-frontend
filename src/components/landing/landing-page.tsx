"use client";

import { BrandMark } from "@/components/landing/brand-mark";
import {
  CampusesMock,
  DaycareMock,
  RolesMock,
} from "@/components/landing/deep-mocks";
import { HeroVisual } from "@/components/landing/hero-visual";
import { LandingNav } from "@/components/landing/landing-nav";
import { ProblemCompare } from "@/components/landing/problem-compare";
import { Reveal } from "@/components/landing/reveal";
import { TiltCard } from "@/components/landing/tilt-card";
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
  GraduationCap,
  Lock,
  Mail,
  MessageSquare,
  School,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type PillarKey = "students" | "academic" | "billing" | "comms";

const PILLARS: Array<{
  key: PillarKey;
  icon: LucideIcon;
  tone: string;
  glow: string;
  span: string;
  wide: boolean;
}> = [
  {
    key: "students",
    icon: Users,
    tone: "from-violet-500 to-indigo-500",
    glow: "rgba(139,92,246,0.18)",
    span: "lg:col-span-4",
    wide: true,
  },
  {
    key: "academic",
    icon: BookOpen,
    tone: "from-sky-500 to-cyan-400",
    glow: "rgba(14,165,233,0.18)",
    span: "lg:col-span-2",
    wide: false,
  },
  {
    key: "billing",
    icon: Wallet,
    tone: "from-emerald-500 to-teal-400",
    glow: "rgba(16,185,129,0.18)",
    span: "lg:col-span-2",
    wide: false,
  },
  {
    key: "comms",
    icon: MessageSquare,
    tone: "from-amber-500 to-orange-400",
    glow: "rgba(245,158,11,0.18)",
    span: "lg:col-span-4",
    wide: true,
  },
];

const DEEP = [
  { key: "campuses" as const, icon: Building2, reverse: false },
  { key: "roles" as const, icon: ShieldCheck, reverse: true },
  { key: "daycare" as const, icon: Baby, reverse: false },
];

const AUDIENCES = [
  { key: "nursery", icon: Baby, tone: "from-pink-500 to-rose-400" },
  { key: "school", icon: School, tone: "from-violet-500 to-indigo-500" },
  { key: "high", icon: GraduationCap, tone: "from-sky-500 to-blue-500" },
  { key: "tutoring", icon: BookOpen, tone: "from-emerald-500 to-teal-400" },
] as const;

const TRUST = [
  { key: "isolation" as const, icon: Lock },
  { key: "roles" as const, icon: Fingerprint },
  { key: "privacy" as const, icon: ShieldCheck },
];

const HERO_HIGHLIGHTS = ["multiCampus", "roleAccess", "daycare"] as const;

export function LandingPage() {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");
  const appName = tCommon("appName");

  return (
    <div className="min-h-svh overflow-x-clip bg-[#fbfbfe] text-foreground">
      <LandingNav />

      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden pt-28 sm:pt-32">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 start-1/2 h-[42rem] w-[70rem] -translate-x-1/2 rtl:translate-x-1/2 motion-safe:animate-[aurora_22s_ease-in-out_infinite]">
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,91,255,0.22),rgba(56,189,248,0.18),rgba(236,72,153,0.12),rgba(139,92,246,0.2),rgba(99,91,255,0.22))] blur-[90px]" />
            </div>
            <div className="absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.045)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,black_10%,transparent_75%)]" />
            <div className="absolute inset-0 bg-grain opacity-[0.035] mix-blend-multiply" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-[#fbfbfe]" />
          </div>

          <div className="relative mx-auto grid max-w-6xl gap-16 px-4 pb-20 sm:px-6 sm:pb-24 lg:grid-cols-[1.02fr_0.98fr] lg:items-center lg:gap-14 lg:px-8 lg:pb-28">
            <div className="motion-safe:animate-[fade-up_0.9s_cubic-bezier(0.22,1,0.36,1)_both]">
              <a
                href="#product"
                className="group inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 py-1 ps-1 pe-3 text-xs font-medium text-slate-700 shadow-[0_4px_16px_-8px_rgba(99,91,255,0.4)] backdrop-blur-md transition-colors hover:border-primary/30"
              >
                <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-primary to-violet-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                  <Sparkles className="size-3" aria-hidden />
                  {appName}
                </span>
                {t("hero.badge")}
                <ArrowRight
                  className="size-3 text-primary transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                  aria-hidden
                />
              </a>

              <h1 className="mt-6 max-w-xl text-balance text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.035em] text-slate-950 sm:text-6xl lg:text-[4rem]">
                {t.rich("hero.headline", {
                  accent: (chunks) => (
                    <span className="text-gradient-brand motion-safe:animate-[shimmer_8s_linear_infinite]">
                      {chunks}
                    </span>
                  ),
                })}
              </h1>
              <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                {t("hero.subhead")}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <PrimaryCta href="/register">{t("hero.ctaPrimary")}</PrimaryCta>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full border-slate-200 bg-white/70 px-6 text-[0.95rem] shadow-sm backdrop-blur-md hover:bg-white"
                >
                  <a href="#contact">{t("hero.ctaSecondary")}</a>
                </Button>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <ShieldCheck className="size-4 text-emerald-500" aria-hidden />
                {t("hero.note")}
              </p>

              <ul className="mt-10 grid gap-3 border-t border-slate-200/80 pt-7 sm:grid-cols-3 sm:gap-4">
                {HERO_HIGHLIGHTS.map((key, i) => (
                  <li
                    key={key}
                    className="flex items-start gap-2.5 text-sm leading-snug text-slate-700"
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-white shadow-sm",
                        [
                          "bg-linear-to-br from-violet-500 to-primary",
                          "bg-linear-to-br from-sky-500 to-blue-500",
                          "bg-linear-to-br from-pink-500 to-rose-400",
                        ][i],
                      )}
                    >
                      <Check className="size-3" strokeWidth={3} aria-hidden />
                    </span>
                    <span>{t(`hero.highlights.${key}`)}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="motion-safe:animate-[fade-up_1.1s_0.15s_cubic-bezier(0.22,1,0.36,1)_both] lg:ps-4">
              <HeroVisual
                className="w-full"
                labels={{
                  title: t("preview.title"),
                  subtitle: t("preview.subtitle"),
                  students: t("preview.students"),
                  attendance: t("preview.attendance"),
                  invoices: t("preview.invoices"),
                  present: t("preview.present"),
                  late: t("preview.late"),
                  paid: t("preview.paid"),
                }}
                chips={{
                  attendance: t("preview.chips.attendance"),
                  payment: t("preview.chips.payment"),
                  paymentMeta: t("preview.chips.paymentMeta"),
                  announce: t("preview.chips.announce"),
                  announceMeta: t("preview.chips.announceMeta"),
                }}
              />
            </div>
          </div>

          {/* Built-for marquee */}
          <div className="relative border-y border-slate-200/70 bg-white/60 py-5 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 sm:px-6 lg:px-8">
              <p className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 sm:block">
                {t("hero.builtFor")}
              </p>
              <div className="relative flex-1 overflow-hidden mask-fade-x">
                <div
                  dir="ltr"
                  className="flex w-max gap-4 motion-safe:animate-[marquee_32s_linear_infinite] hover:[animation-play-state:paused]"
                >
                  {[0, 1, 2, 3].flatMap((round) =>
                    AUDIENCES.map(({ key, icon: Icon, tone }) => (
                      <span
                        key={`${round}-${key}`}
                        aria-hidden={round > 0 || undefined}
                        className="flex shrink-0 items-center gap-2.5 rounded-full border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                      >
                        <span
                          className={cn(
                            "flex size-6 items-center justify-center rounded-full bg-linear-to-br text-white",
                            tone,
                          )}
                        >
                          <Icon className="size-3.5" aria-hidden />
                        </span>
                        <span dir="auto">{t(`audience.items.${key}.title`)}</span>
                      </span>
                    )),
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Problem */}
        <section className="relative isolate overflow-hidden py-24 sm:py-28 lg:py-32">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute start-1/2 top-24 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,91,255,0.1),transparent_65%)] rtl:translate-x-1/2" />
          </div>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("problem.eyebrow")}
              title={t("problem.headline")}
              body={t("problem.body")}
            />
            <Reveal delay={100} className="mt-14 sm:mt-16">
              <ProblemCompare
                appName={appName}
                labels={{
                  before: t("problem.before"),
                  after: t("problem.after"),
                  flowLabel: t("problem.flowLabel"),
                  flowTo: t("problem.flowTo"),
                  result: t("problem.result"),
                  beforeLead: t("problem.beforeLead"),
                  beforeTitle: t("problem.beforeTitle"),
                  afterLead: t("problem.afterLead"),
                  beforeSummary: t("problem.beforeSummary"),
                  tools: {
                    excel: {
                      title: t("problem.tools.excel.title"),
                      body: t("problem.tools.excel.body"),
                    },
                    whatsapp: {
                      title: t("problem.tools.whatsapp.title"),
                      body: t("problem.tools.whatsapp.body"),
                    },
                    paper: {
                      title: t("problem.tools.paper.title"),
                      body: t("problem.tools.paper.body"),
                    },
                    calls: {
                      title: t("problem.tools.calls.title"),
                      body: t("problem.tools.calls.body"),
                    },
                  },
                  modules: {
                    students: {
                      title: t("problem.modules.students.title"),
                      body: t("problem.modules.students.body"),
                    },
                    academic: {
                      title: t("problem.modules.academic.title"),
                      body: t("problem.modules.academic.body"),
                    },
                    billing: {
                      title: t("problem.modules.billing.title"),
                      body: t("problem.modules.billing.body"),
                    },
                    comms: {
                      title: t("problem.modules.comms.title"),
                      body: t("problem.modules.comms.body"),
                    },
                  },
                  risks: {
                    one: {
                      title: t("problem.risks.one.title"),
                      body: t("problem.risks.one.body"),
                    },
                    two: {
                      title: t("problem.risks.two.title"),
                      body: t("problem.risks.two.body"),
                    },
                    three: {
                      title: t("problem.risks.three.title"),
                      body: t("problem.risks.three.body"),
                    },
                  },
                  outcomes: {
                    one: {
                      title: t("problem.outcomes.one.title"),
                      body: t("problem.outcomes.one.body"),
                    },
                    two: {
                      title: t("problem.outcomes.two.title"),
                      body: t("problem.outcomes.two.body"),
                    },
                    three: {
                      title: t("problem.outcomes.three.title"),
                      body: t("problem.outcomes.three.body"),
                    },
                  },
                }}
              />
            </Reveal>
          </div>
        </section>

        {/* Solution bento */}
        <section
          id="product"
          className="relative isolate scroll-mt-24 overflow-hidden border-t border-slate-200/70 bg-white py-24 sm:py-28 lg:py-32"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute inset-0 [background-image:radial-gradient(rgba(15,23,42,0.07)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent_75%)]" />
          </div>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("solution.eyebrow")}
              title={t("solution.headline")}
              body={t("solution.subhead")}
            />

            <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-6 lg:gap-5">
              {PILLARS.map(({ key, icon: Icon, tone, glow, span, wide }, i) => (
                <Reveal
                  key={key}
                  delay={i * 80}
                  depth
                  className={cn(span, wide && "sm:col-span-2")}
                >
                  <TiltCard>
                    <article
                      className="group relative h-full overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-b from-white to-slate-50/80 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_48px_-32px_rgba(30,27,75,0.25)] transition-[border-color,box-shadow] duration-500 hover:border-slate-300/80 hover:shadow-[0_1px_2px_rgba(15,23,42,0.04),0_36px_64px_-32px_rgba(30,27,75,0.35)] sm:p-7"
                    >
                      <div
                        aria-hidden
                        className="pointer-events-none absolute -end-16 -top-16 size-56 rounded-full opacity-60 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: `radial-gradient(circle, ${glow}, transparent 70%)` }}
                      />
                      <div
                        className={cn(
                          "relative grid h-full gap-7",
                          wide && "md:grid-cols-[1fr_1.05fr] md:items-center",
                        )}
                      >
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between gap-3">
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
                          <h3 className="mt-6 text-lg font-semibold tracking-tight text-slate-950">
                            {t(`solution.pillars.${key}.title`)}
                          </h3>
                          <p className="mt-2 text-[0.9375rem] leading-relaxed text-slate-600">
                            {t(`solution.pillars.${key}.body`)}
                          </p>
                          <ul className="mt-5 flex flex-wrap gap-2">
                            {(["one", "two", "three"] as const).map((point) => (
                              <li
                                key={point}
                                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                              >
                                <Check className="size-3 text-primary" strokeWidth={3} aria-hidden />
                                {t(`solution.pillars.${key}.points.${point}`)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <PillarVisual kind={key} />
                      </div>
                    </article>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Deep dives */}
        <section className="relative isolate overflow-hidden bg-[#fbfbfe] py-10 sm:py-14">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute start-0 top-1/4 size-[32rem] rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.08),transparent_65%)]" />
            <div className="absolute end-0 bottom-1/4 size-[32rem] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.08),transparent_65%)]" />
          </div>
          {DEEP.map(({ key, icon: Icon, reverse }, index) => (
            <Reveal
              key={key}
              depth
              className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-20 lg:px-8"
            >
              <div className={reverse ? "lg:order-2" : undefined}>
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl border border-primary/15 bg-white text-primary shadow-[0_8px_20px_-12px_rgba(99,91,255,0.6)]">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-mono text-xs font-semibold tabular-nums text-slate-400">
                    0{index + 1} <span className="text-slate-300">/ 0{DEEP.length}</span>
                  </span>
                </div>
                <h2 className="mt-6 text-balance text-3xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-4xl sm:leading-[1.1]">
                  {t(`deep.${key}.headline`)}
                </h2>
                <p className="mt-5 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                  {t(`deep.${key}.body`)}
                </p>
                <ul className="mt-8 space-y-3.5">
                  {(["one", "two", "three"] as const).map((point) => (
                    <li
                      key={point}
                      className="flex items-start gap-3 text-[0.95rem] text-slate-700"
                    >
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/15">
                        <Check className="size-3" strokeWidth={3} aria-hidden />
                      </span>
                      <span>{t(`deep.${key}.points.${point}`)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <figure className={reverse ? "lg:order-1" : undefined}>
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute -inset-6 -z-10 rounded-[2.5rem] bg-linear-to-br from-primary/15 via-violet-400/10 to-sky-400/15 blur-2xl"
                  />
                  <div className="rounded-[1.75rem] border border-white/80 bg-linear-to-br from-white/80 to-indigo-50/60 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-900/5 backdrop-blur-xl sm:p-4">
                    <div
                      className={
                        reverse
                          ? "motion-safe:lg:[transform:perspective(1200px)_rotateY(2deg)] rtl:motion-safe:lg:[transform:perspective(1200px)_rotateY(-2deg)]"
                          : "motion-safe:lg:[transform:perspective(1200px)_rotateY(-2deg)] rtl:motion-safe:lg:[transform:perspective(1200px)_rotateY(2deg)]"
                      }
                    >
                      {key === "campuses" && (
                        <CampusesMock
                          labels={{
                            org: t("deep.campuses.mock.org"),
                            campuses: t("deep.campuses.mock.campuses"),
                            active: t("deep.campuses.mock.active"),
                            staff: t("deep.campuses.mock.staff"),
                            students: t("deep.campuses.mock.students"),
                            campusA: t("deep.campuses.mock.campusA"),
                            campusB: t("deep.campuses.mock.campusB"),
                            campusC: t("deep.campuses.mock.campusC"),
                          }}
                        />
                      )}
                      {key === "roles" && (
                        <RolesMock
                          labels={{
                            title: t("deep.roles.mock.title"),
                            admin: t("deep.roles.mock.admin"),
                            teacher: t("deep.roles.mock.teacher"),
                            parent: t("deep.roles.mock.parent"),
                            adminDesc: t("deep.roles.mock.adminDesc"),
                            teacherDesc: t("deep.roles.mock.teacherDesc"),
                            parentDesc: t("deep.roles.mock.parentDesc"),
                            active: t("deep.roles.mock.active"),
                          }}
                        />
                      )}
                      {key === "daycare" && (
                        <DaycareMock
                          labels={{
                            title: t("deep.daycare.mock.title"),
                            date: t("deep.daycare.mock.date"),
                            meals: t("deep.daycare.mock.meals"),
                            naps: t("deep.daycare.mock.naps"),
                            pickups: t("deep.daycare.mock.pickups"),
                            lunch: t("deep.daycare.mock.lunch"),
                            consumed: t("deep.daycare.mock.consumed"),
                            napDone: t("deep.daycare.mock.napDone"),
                            verified: t("deep.daycare.mock.verified"),
                            childA: t("deep.daycare.mock.childA"),
                            childB: t("deep.daycare.mock.childB"),
                            childC: t("deep.daycare.mock.childC"),
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                <figcaption className="mt-4 text-center text-xs text-slate-500">
                  {t(`deep.${key}.caption`)}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </section>

        {/* Who it's for */}
        <section className="relative border-t border-slate-200/70 bg-white py-24 sm:py-28 lg:py-32">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow={t("audience.eyebrow")}
              title={t("audience.headline")}
              body={t("audience.subhead")}
            />
            <div className="mt-14 grid gap-4 sm:mt-16 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {AUDIENCES.map(({ key, icon: Icon, tone }, i) => (
                <Reveal key={key} delay={i * 60} className="h-full">
                  <div className="group relative h-full rounded-3xl bg-linear-to-b from-slate-200/90 to-slate-200/30 p-px transition-[background-color] duration-500 hover:from-primary/50 hover:to-sky-400/30">
                    <div className="relative flex h-full flex-col overflow-hidden rounded-[calc(1.5rem-1px)] bg-white p-6">
                      <div
                        aria-hidden
                        className={cn(
                          "absolute -end-10 -top-10 size-32 rounded-full bg-linear-to-br opacity-[0.08] blur-2xl transition-opacity duration-500 group-hover:opacity-25",
                          tone,
                        )}
                      />
                      <span
                        className={cn(
                          "relative flex size-12 items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-[0_12px_24px_-12px_rgba(15,23,42,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-hover:rotate-[-4deg]",
                          tone,
                        )}
                      >
                        <Icon className="size-5" aria-hidden />
                      </span>
                      <h3 className="relative mt-8 text-lg font-semibold tracking-tight text-slate-950">
                        {t(`audience.items.${key}.title`)}
                      </h3>
                      <p className="relative mt-2 text-sm leading-relaxed text-slate-600">
                        {t(`audience.items.${key}.body`)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Trust */}
        <section className="relative isolate overflow-hidden bg-[#070a1a] py-24 text-slate-100 sm:py-28 lg:py-32">
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute start-1/2 -top-48 h-[36rem] w-[60rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,91,255,0.35),transparent_60%)] rtl:translate-x-1/2" />
            <div className="absolute -bottom-40 end-0 size-[30rem] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.15),transparent_65%)]" />
            <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_30%,black,transparent_75%)]" />
          </div>
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal className="mx-auto max-w-2xl text-center">
              <div className="relative mx-auto flex size-16 items-center justify-center">
                <span className="absolute inset-0 rounded-2xl bg-primary/40 blur-xl" />
                <span className="relative flex size-16 items-center justify-center rounded-2xl border border-white/15 bg-linear-to-b from-white/15 to-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] backdrop-blur">
                  <ShieldCheck className="size-7 text-white" strokeWidth={1.75} aria-hidden />
                </span>
              </div>
              <Eyebrow className="mt-8" dark>
                {t("trust.eyebrow")}
              </Eyebrow>
              <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.025em] text-white sm:text-[2.75rem] sm:leading-[1.1]">
                {t("trust.headline")}
              </h2>
              <p className="mt-5 text-pretty text-base leading-relaxed text-slate-400 sm:text-lg">
                {t("trust.body")}
              </p>
            </Reveal>

            <div className="mt-16 grid gap-4 md:grid-cols-3 lg:gap-5">
              {TRUST.map(({ key, icon: Icon }, i) => (
                <Reveal key={key} delay={i * 80} className="h-full">
                  <div className="group relative h-full rounded-3xl bg-linear-to-b from-white/15 to-white/[0.03] p-px">
                    <div className="relative h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-[#0b0f24]/90 p-7">
                      <div
                        aria-hidden
                        className="absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-sky-300/60 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                      <span className="flex size-11 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                        <Icon className="size-5 text-sky-300" aria-hidden />
                      </span>
                      <p className="mt-6 text-base font-semibold text-white">
                        {t(`trust.titles.${key}`)}
                      </p>
                      <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                        {t(`trust.points.${key}`)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section
          id="pricing"
          className="relative scroll-mt-24 bg-[#fbfbfe] py-24 sm:py-28 lg:py-32"
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_40px_80px_-48px_rgba(30,27,75,0.4)]">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -end-24 -top-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.16),transparent_65%)]"
                />
                <div className="relative grid lg:grid-cols-[1.15fr_0.85fr]">
                  <div className="p-8 sm:p-12 lg:p-14">
                    <Eyebrow>{t("pricing.eyebrow")}</Eyebrow>
                    <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-4xl sm:leading-[1.1]">
                      {t("pricing.headline")}
                    </h2>
                    <p className="mt-5 max-w-lg text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
                      {t("pricing.body")}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center gap-7 border-t border-slate-200/80 bg-linear-to-br from-slate-50 to-indigo-50/60 p-8 sm:p-12 lg:border-s lg:border-t-0 lg:p-14">
                    <ul className="space-y-4">
                      {(["setup", "modules", "support"] as const).map((item) => (
                        <li
                          key={item}
                          className="flex items-center gap-3 text-[0.95rem] font-medium text-slate-800"
                        >
                          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary to-violet-500 text-white shadow-[0_6px_12px_-6px_rgba(99,91,255,0.8)]">
                            <Check className="size-3.5" strokeWidth={3} aria-hidden />
                          </span>
                          {t(`pricing.perks.${item}`)}
                        </li>
                      ))}
                    </ul>
                    <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                      <PrimaryCta href="/register" className="w-full justify-center sm:w-auto lg:w-full">
                        {t("pricing.ctaPrimary")}
                      </PrimaryCta>
                      <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="h-12 rounded-full border-slate-200 bg-white px-6 text-[0.95rem]"
                      >
                        <a href="mailto:contact@ecolnaspace.com">
                          {t("pricing.ctaSecondary")}
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Final CTA */}
        <section id="contact" className="scroll-mt-24 px-3 pb-3 sm:px-4 sm:pb-4">
          <Reveal>
            <div className="relative isolate mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] bg-[#0b0a2e] px-6 py-20 text-center sm:py-24 lg:py-28">
              <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute start-1/2 top-full h-[40rem] w-[80rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_90deg,rgba(99,91,255,0.7),rgba(56,189,248,0.5),rgba(236,72,153,0.4),rgba(99,91,255,0.7))] blur-[100px] rtl:translate-x-1/2 motion-safe:animate-[aurora_24s_ease-in-out_infinite]" />
                <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_50%_70%_at_50%_0%,black,transparent_80%)]" />
                <div className="absolute inset-0 bg-grain opacity-[0.06] mix-blend-overlay" />
              </div>
              <div className="mx-auto max-w-3xl">
                <BrandMark className="justify-center" />
                <h2 className="mt-8 text-balance text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl sm:leading-[1.08]">
                  {t("final.headline")}
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-indigo-100/80 sm:text-lg">
                  {t("final.body")}
                </p>
                <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="group h-12 rounded-full bg-white px-6 text-[0.95rem] text-slate-950 shadow-[0_12px_32px_-8px_rgba(255,255,255,0.35)] hover:bg-indigo-50"
                  >
                    <Link href="/register">
                      {t("final.cta")}
                      <ArrowRight
                        className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
                        aria-hidden
                      />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 rounded-full border-white/20 bg-white/5 px-6 text-[0.95rem] text-white backdrop-blur hover:bg-white/10 hover:text-white"
                  >
                    <a href="mailto:contact@ecolnaspace.com">
                      <Mail className="size-4" aria-hidden />
                      {t("final.email")}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative overflow-hidden bg-[#fbfbfe]">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pt-16 pb-10 sm:px-6 md:grid-cols-[1.6fr_1fr_1fr] lg:px-8">
          <div>
            <BrandMark label={appName} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
              {t("footer.blurb")}
            </p>
          </div>
          <FooterColumn title={t("footer.product")}>
            <FooterLink href="#product">{t("nav.product")}</FooterLink>
            <FooterLink href="#pricing">{t("nav.pricing")}</FooterLink>
            <li>
              <Link href="/register" className="transition-colors hover:text-slate-950">
                {t("nav.cta")}
              </Link>
            </li>
          </FooterColumn>
          <FooterColumn title={t("footer.legal")}>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-slate-950">
                {t("footer.privacy")}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-slate-950">
                {t("footer.terms")}
              </Link>
            </li>
            <FooterLink href="mailto:contact@ecolnaspace.com">
              contact@ecolnaspace.com
            </FooterLink>
          </FooterColumn>
        </div>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 border-t border-slate-200/80 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {new Date().getFullYear()} {appName}. {t("footer.rights")}
            </p>
            <p className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              app.ecolnaspace.com
            </p>
          </div>
        </div>
        <p
          aria-hidden
          dir="ltr"
          className="pointer-events-none -mb-[0.22em] select-none text-center text-[clamp(4rem,17vw,15rem)] leading-none font-semibold tracking-[-0.06em] text-transparent [background-clip:text] [-webkit-background-clip:text] bg-linear-to-b from-slate-200 to-slate-50"
        >
          {appName}
        </p>
      </footer>
    </div>
  );
}

function Eyebrow({
  children,
  className,
  dark,
}: {
  children: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <p
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        dark
          ? "border-white/15 bg-white/5 text-indigo-200"
          : "border-primary/15 bg-primary/[0.06] text-primary",
        className,
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          dark ? "bg-sky-300" : "bg-linear-to-br from-primary to-sky-400",
        )}
      />
      {children}
    </p>
  );
}

function SectionHeading({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-[2.75rem] sm:leading-[1.1]">
        {title}
      </h2>
      <p className="mt-5 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
        {body}
      </p>
    </Reveal>
  );
}

function PrimaryCta({
  href,
  children,
  className,
}: {
  href: "/register";
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(
        "group relative h-12 overflow-hidden rounded-full bg-linear-to-b from-[#7a73ff] to-primary px-6 text-[0.95rem] shadow-[0_12px_28px_-10px_rgba(99,91,255,0.8),inset_0_1px_0_rgba(255,255,255,0.3)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-[0_18px_36px_-12px_rgba(99,91,255,0.9),inset_0_1px_0_rgba(255,255,255,0.3)]",
        className,
      )}
    >
      <Link href={href}>
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
        <span className="relative">{children}</span>
        <ArrowRight
          className="relative size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
          aria-hidden
        />
      </Link>
    </Button>
  );
}

function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <ul className="mt-4 space-y-3 text-sm text-slate-500">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <a href={href} className="transition-colors hover:text-slate-950">
        {children}
      </a>
    </li>
  );
}

/** Decorative, text-free mini illustrations for the bento cards. */
function PillarVisual({ kind }: { kind: PillarKey }) {
  const frame =
    "relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_16px_32px_-24px_rgba(30,27,75,0.35)]";

  if (kind === "students") {
    return (
      <div aria-hidden dir="ltr" className={frame}>
        <div className="space-y-2.5">
          {[
            ["bg-violet-500", "w-24", "bg-emerald-50 text-emerald-600"],
            ["bg-sky-500", "w-20", "bg-sky-50 text-sky-600"],
            ["bg-pink-500", "w-28", "bg-emerald-50 text-emerald-600"],
            ["bg-amber-500", "w-16", "bg-violet-50 text-violet-600"],
          ].map(([avatar, width, pill], i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-2.5 py-2 transition-transform duration-500 group-hover:translate-x-1"
              style={{ transitionDelay: `${i * 50}ms` }}
            >
              <span className={cn("size-7 shrink-0 rounded-full ring-2 ring-white", avatar)} />
              <span className="flex-1 space-y-1">
                <span className={cn("block h-2 rounded-full bg-slate-300/80", width)} />
                <span className="block h-1.5 w-12 rounded-full bg-slate-200" />
              </span>
              <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-semibold", pill)}>
                {["A1", "B2", "A3", "C1"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "academic") {
    const cells = [1, 1, 1, 0, 1, 1, 2, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 2, 1, 1, 1];
    return (
      <div aria-hidden dir="ltr" className={frame}>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((c, i) => (
            <span
              key={i}
              className={cn(
                "aspect-square rounded-md transition-transform duration-500 group-hover:scale-105",
                c === 1 && "bg-linear-to-br from-sky-400 to-cyan-300",
                c === 2 && "bg-amber-300",
                c === 0 && "bg-slate-100",
              )}
            />
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl bg-sky-50 px-3 py-2">
          <span className="h-2 w-16 rounded-full bg-sky-200" />
          <span className="text-sm font-semibold tabular-nums text-sky-700">17.5</span>
        </div>
      </div>
    );
  }

  if (kind === "billing") {
    return (
      <div aria-hidden dir="ltr" className={frame}>
        <div className="flex items-center justify-between">
          <span className="h-2 w-16 rounded-full bg-slate-200" />
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
            ✓
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tabular-nums tracking-tight text-slate-900">
          82%
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <span className="block h-full w-[82%] rounded-full bg-linear-to-r from-emerald-500 to-teal-400 transition-[width] duration-700 group-hover:w-[92%]" />
        </div>
        <div className="mt-3 flex gap-1.5">
          {["w-10", "w-14", "w-8"].map((w, i) => (
            <span key={i} className={cn("h-1.5 rounded-full bg-slate-200", w)} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div aria-hidden dir="ltr" className={cn(frame, "space-y-2.5")}>
      <div className="flex items-end gap-2">
        <span className="size-6 shrink-0 rounded-full bg-amber-400" />
        <span className="max-w-[75%] rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2">
          <span className="block h-2 w-32 rounded-full bg-slate-300/80" />
          <span className="mt-1.5 block h-2 w-20 rounded-full bg-slate-300/60" />
        </span>
      </div>
      <div className="flex items-end justify-end gap-2">
        <span className="max-w-[75%] rounded-2xl rounded-br-md bg-linear-to-br from-primary to-violet-500 px-3 py-2 shadow-[0_8px_16px_-8px_rgba(99,91,255,0.7)] transition-transform duration-500 group-hover:-translate-y-0.5">
          <span className="block h-2 w-28 rounded-full bg-white/60" />
          <span className="mt-1.5 block h-2 w-16 rounded-full bg-white/40" />
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-amber-200/70 bg-amber-50/70 px-3 py-2">
        <span className="size-2 rounded-full bg-amber-500 motion-safe:animate-pulse" />
        <span className="h-2 w-24 rounded-full bg-amber-200" />
        <span className="ms-auto flex -space-x-1.5">
          {["bg-violet-400", "bg-sky-400", "bg-pink-400"].map((c) => (
            <span key={c} className={cn("size-4 rounded-full ring-2 ring-white", c)} />
          ))}
        </span>
      </div>
    </div>
  );
}
