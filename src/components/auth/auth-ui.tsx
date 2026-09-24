"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, Loader2, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function AuthHeading({
  icon: Icon,
  title,
  subtitle,
  compact,
}: {
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "flex items-start gap-3" : undefined}>
      <span
        className={
          compact
            ? "relative flex size-9 shrink-0 items-center justify-center"
            : "relative flex size-10 items-center justify-center sm:size-11"
        }
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-2xl bg-primary/30 blur-lg"
        />
        <span
          className={
            compact
              ? "relative flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-[#7c73ff] via-primary to-[#3b82f6] text-white shadow-[0_10px_24px_-10px_rgba(99,91,255,0.8),inset_0_1px_0_rgba(255,255,255,0.35)]"
              : "relative flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-[#7c73ff] via-primary to-[#3b82f6] text-white shadow-[0_10px_24px_-10px_rgba(99,91,255,0.8),inset_0_1px_0_rgba(255,255,255,0.35)] sm:size-11"
          }
        >
          <Icon
            className={compact ? "size-4" : "size-4 sm:size-5"}
            strokeWidth={2}
            aria-hidden
          />
        </span>
      </span>
      <div className={compact ? "min-w-0 pt-0.5" : undefined}>
        <h1
          className={
            compact
              ? "text-balance text-[1.25rem] font-semibold leading-tight tracking-[-0.025em] text-slate-950"
              : "mt-4 text-balance text-[1.5rem] font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:mt-5 sm:text-[1.65rem]"
          }
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={
              compact
                ? "mt-0.5 text-pretty text-[12px] leading-snug text-slate-500 line-clamp-1"
                : "mt-1.5 text-pretty text-[13px] leading-relaxed text-slate-500 sm:text-sm"
            }
          >
            {subtitle}
          </p>
        ) : null}
      </div>
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
      className="group relative mt-0.5 h-9 w-full overflow-hidden rounded-xl bg-linear-to-b from-[#7a73ff] to-primary text-sm shadow-[0_12px_28px_-12px_rgba(99,91,255,0.9),inset_0_1px_0_rgba(255,255,255,0.3)] transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-px hover:shadow-[0_18px_36px_-14px_rgba(99,91,255,0.95),inset_0_1px_0_rgba(255,255,255,0.3)] sm:h-10"
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

export function AuthDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "my-4 h-px bg-linear-to-r from-transparent via-slate-200 to-transparent",
        className,
      )}
    />
  );
}

export const authLinkClass =
  "font-semibold text-primary underline-offset-4 transition-colors hover:text-primary-dark hover:underline";
