"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AuthHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
}) {
  return (
    <div>
      <span className="relative flex size-12 items-center justify-center">
        <span
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-primary/30 blur-lg"
        />
        <span className="relative flex size-12 items-center justify-center rounded-2xl bg-linear-to-br from-[#7c73ff] via-primary to-[#3b82f6] text-white shadow-[0_10px_24px_-10px_rgba(99,91,255,0.8),inset_0_1px_0_rgba(255,255,255,0.35)]">
          <Icon className="size-5" strokeWidth={2} aria-hidden />
        </span>
      </span>
      <h1 className="mt-6 text-balance text-[1.75rem] font-semibold leading-tight tracking-[-0.025em] text-slate-950">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-2 text-pretty text-sm leading-relaxed text-slate-500">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

const ALERT_TONES = {
  error: "border-rose-200/80 bg-rose-50/80 text-rose-800",
  warning: "border-amber-200/80 bg-amber-50/80 text-amber-900",
  success: "border-emerald-200/80 bg-emerald-50/80 text-emerald-900",
  info: "border-slate-200/80 bg-slate-50/80 text-slate-700",
} as const;

export function AuthAlert({
  tone,
  children,
  className,
}: {
  tone: keyof typeof ALERT_TONES;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed",
        ALERT_TONES[tone],
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <span
        aria-hidden
        className={cn(
          "mt-[0.45rem] size-1.5 shrink-0 rounded-full",
          tone === "error" && "bg-rose-500",
          tone === "warning" && "bg-amber-500",
          tone === "success" && "bg-emerald-500",
          tone === "info" && "bg-primary",
        )}
      />
      <span>{children}</span>
    </p>
  );
}

export function AuthSubmit({
  pending,
  pendingLabel,
  children,
}: {
  pending: boolean;
  pendingLabel: ReactNode;
  children: ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={pending}
      className="group relative mt-2 h-11 w-full overflow-hidden rounded-xl bg-linear-to-b from-[#7a73ff] to-primary text-[0.95rem] shadow-[0_12px_28px_-12px_rgba(99,91,255,0.9),inset_0_1px_0_rgba(255,255,255,0.3)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:shadow-[0_18px_36px_-14px_rgba(99,91,255,0.95),inset_0_1px_0_rgba(255,255,255,0.3)]"
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
      />
      {pending ? (
        <span className="relative inline-flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingLabel}
        </span>
      ) : (
        <span className="relative inline-flex items-center gap-2">
          {children}
          <ArrowRight
            className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5"
            aria-hidden
          />
        </span>
      )}
    </Button>
  );
}

export function AuthDivider() {
  return (
    <div
      aria-hidden
      className="my-6 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent"
    />
  );
}

export const authLinkClass =
  "font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-dark hover:underline";
