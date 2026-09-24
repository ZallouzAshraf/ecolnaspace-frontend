"use client";

import { Reveal } from "@/components/landing/reveal";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

export type MarketingHref = ComponentProps<typeof Link>["href"];

export function Eyebrow({
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

export function SectionHeading({
  eyebrow,
  title,
  body,
  className,
}: {
  eyebrow: string;
  title: string;
  body?: string;
  className?: string;
}) {
  return (
    <Reveal className={cn("mx-auto max-w-2xl text-center", className)}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-5 text-balance text-3xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-[2.75rem] sm:leading-[1.1]">
        {title}
      </h2>
      {body ? (
        <p className="mt-5 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
          {body}
        </p>
      ) : null}
    </Reveal>
  );
}

export function PrimaryCta({
  href,
  children,
  className,
}: {
  href: MarketingHref;
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

export function SecondaryCta({
  href,
  children,
  className,
}: {
  href: MarketingHref;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Button
      asChild
      size="lg"
      variant="outline"
      className={cn(
        "h-12 rounded-full border-slate-200 bg-white/70 px-6 text-[0.95rem] shadow-sm backdrop-blur-md hover:bg-white",
        className,
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
}

/** Hero block shared by the inner marketing pages (pricing, contact, legal). */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  compact,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="relative isolate overflow-hidden pt-32 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 start-1/2 h-[34rem] w-[64rem] -translate-x-1/2 rtl:translate-x-1/2">
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,rgba(99,91,255,0.18),rgba(56,189,248,0.14),rgba(236,72,153,0.08),rgba(139,92,246,0.16),rgba(99,91,255,0.18))] blur-[90px]" />
        </div>
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_20%,black_10%,transparent_75%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-[#fbfbfe]" />
      </div>
      <div
        className={cn(
          "mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8",
          compact ? "pb-12 sm:pb-14" : "pb-16 sm:pb-20",
        )}
      >
        <div className="motion-safe:animate-[fade-up_0.8s_cubic-bezier(0.22,1,0.36,1)_both]">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-slate-950 sm:text-5xl lg:text-[3.4rem]">
            {title}
          </h1>
          {lead ? (
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              {lead}
            </p>
          ) : null}
          {children}
        </div>
      </div>
    </section>
  );
}
