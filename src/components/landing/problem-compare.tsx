"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BookOpen,
  Check,
  Clock,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  MessageCircle,
  MessageSquare,
  Phone,
  ShieldCheck,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

const TOOLS = [
  {
    key: "excel",
    icon: FileSpreadsheet,
    tone: "bg-violet-500/10 text-violet-600",
  },
  {
    key: "whatsapp",
    icon: MessageCircle,
    tone: "bg-sky-500/10 text-sky-600",
  },
  {
    key: "paper",
    icon: FileText,
    tone: "bg-amber-500/10 text-amber-600",
  },
  {
    key: "calls",
    icon: Phone,
    tone: "bg-rose-500/10 text-rose-600",
  },
] as const;

const MODULES = [
  {
    key: "students",
    icon: Users,
    tone: "bg-primary/10 text-primary",
  },
  {
    key: "academic",
    icon: BookOpen,
    tone: "bg-sky-500/10 text-sky-600",
  },
  {
    key: "billing",
    icon: Wallet,
    tone: "bg-emerald-500/10 text-emerald-600",
  },
  {
    key: "comms",
    icon: MessageSquare,
    tone: "bg-violet-500/10 text-violet-600",
  },
] as const;

const RISKS = [
  { key: "one" as const, icon: Clock },
  { key: "two" as const, icon: AlertTriangle },
  { key: "three" as const, icon: FolderOpen },
];

const OUTCOMES = [
  { key: "one" as const, icon: ShieldCheck },
  { key: "two" as const, icon: FolderOpen },
  { key: "three" as const, icon: Check },
];

type ProblemCompareProps = {
  className?: string;
  appName: string;
  labels: {
    before: string;
    after: string;
    flowLabel: string;
    flowTo: string;
    result: string;
    beforeTitle: string;
    beforeLead: string;
    afterLead: string;
    beforeSummary: string;
    tools: Record<(typeof TOOLS)[number]["key"], { title: string; body: string }>;
    modules: Record<
      (typeof MODULES)[number]["key"],
      { title: string; body: string }
    >;
    risks: Record<"one" | "two" | "three", { title: string; body: string }>;
    outcomes: Record<"one" | "two" | "three", { title: string; body: string }>;
  };
};

export function ProblemCompare({
  className,
  appName,
  labels,
}: ProblemCompareProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-1.5 shadow-[0_40px_80px_-40px_rgba(30,27,75,0.35)] ring-1 ring-slate-900/5 backdrop-blur-xl",
        className,
      )}
    >
      <div className="grid gap-1.5 lg:grid-cols-2 lg:items-stretch">
        {/* Avant */}
        <Panel className="rounded-[1.4rem] bg-slate-50/90 [background-image:repeating-linear-gradient(135deg,rgba(15,23,42,0.025)_0_1px,transparent_1px_10px)]">
          <PanelHeader
            label={labels.before}
            badge={labels.flowLabel}
            badgeClassName="border-border bg-background text-muted-foreground"
            labelClassName="text-muted-foreground"
          />
          <PanelIntro title={labels.beforeTitle} lead={labels.beforeLead} />
          <ul className="mt-6 grid flex-1 grid-rows-4 gap-3">
            {TOOLS.map(({ key, icon: Icon, tone }) => (
              <InfoRow
                key={key}
                icon={Icon}
                tone={tone}
                title={labels.tools[key].title}
                body={labels.tools[key].body}
              />
            ))}
          </ul>
          <PanelFooter
            summary={labels.beforeSummary}
            items={RISKS.map(({ key, icon }) => ({
              icon,
              title: labels.risks[key].title,
              body: labels.risks[key].body,
              tone: "bg-amber-500/12 text-amber-600",
            }))}
            className="border-border/80 bg-background/80"
          />
        </Panel>

        {/* Après */}
        <Panel className="relative overflow-hidden rounded-[1.4rem] bg-linear-to-br from-indigo-50 via-white to-sky-50 ring-1 ring-primary/15">
          <div
            aria-hidden
            className="pointer-events-none absolute -end-16 -top-20 size-64 rounded-full bg-primary/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -start-10 size-56 rounded-full bg-sky-400/15 blur-3xl"
          />
          <div className="relative flex h-full flex-col">
            <PanelHeader
              label={labels.after}
              badge={labels.flowTo}
              badgeClassName="border-primary/20 bg-primary/10 text-primary"
              labelClassName="text-primary"
            />
            <PanelIntro title={appName} lead={labels.afterLead} />
            <ul className="mt-6 grid flex-1 grid-rows-4 gap-3">
              {MODULES.map(({ key, icon: Icon, tone }) => (
                <InfoRow
                  key={key}
                  icon={Icon}
                  tone={tone}
                  title={labels.modules[key].title}
                  body={labels.modules[key].body}
                />
              ))}
            </ul>
            <PanelFooter
              summary={labels.result}
              items={OUTCOMES.map(({ key, icon }) => ({
                icon,
                title: labels.outcomes[key].title,
                body: labels.outcomes[key].body,
                tone: "bg-emerald-500/12 text-emerald-600",
              }))}
              className="border-primary/15 bg-background/70"
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col p-6 sm:p-7 lg:p-8", className)}>
      {children}
    </div>
  );
}

function PanelHeader({
  label,
  badge,
  labelClassName,
  badgeClassName,
}: {
  label: string;
  badge: string;
  labelClassName?: string;
  badgeClassName?: string;
}) {
  return (
    <div className="flex h-7 shrink-0 items-center justify-between gap-3">
      <p
        className={cn(
          "text-[11px] font-semibold uppercase tracking-[0.14em]",
          labelClassName,
        )}
      >
        {label}
      </p>
      <span
        className={cn(
          "rounded-full border px-2.5 py-1 text-[10px] font-medium",
          badgeClassName,
        )}
      >
        {badge}
      </span>
    </div>
  );
}

function PanelIntro({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="mt-6 flex h-[5.25rem] shrink-0 flex-col justify-start sm:h-[5.5rem]">
      <p className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {title}
      </p>
      <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {lead}
      </p>
    </div>
  );
}

function PanelFooter({
  summary,
  items,
  className,
}: {
  summary: string;
  items: Array<{
    icon: LucideIcon;
    title: string;
    body: string;
    tone: string;
  }>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-6 flex min-h-[9.25rem] shrink-0 flex-col rounded-xl border p-4",
        className,
      )}
    >
      <p className="mb-0.5 line-clamp-2 text-sm font-medium leading-relaxed text-foreground/90">
        {summary}
      </p>
      <div className="mt-3.5 mb-0.5 border-t border-border/70" />
      <ul className="grid flex-1 gap-3 pt-3.5 sm:grid-cols-3 sm:gap-3.5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.title} className="flex items-start gap-2.5">
              <span
                className={cn(
                  "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md",
                  item.tone,
                )}
              >
                <Icon className="size-3" strokeWidth={2.25} aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground">
                  {item.title}
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
                  {item.body}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  tone,
  title,
  body,
}: {
  icon: LucideIcon;
  tone: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex h-full min-h-[4.25rem] items-center gap-3.5 rounded-xl border border-slate-200/70 bg-white/90 px-3.5 py-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_24px_-16px_rgba(30,27,75,0.35)]">
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-lg",
          tone,
        )}
      >
        <Icon className="size-4" strokeWidth={1.75} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold tracking-tight text-foreground">
          {title}
        </p>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
          {body}
        </p>
      </div>
    </li>
  );
}
