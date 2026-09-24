"use client";

import { getPasswordChecks } from "@/lib/auth/password";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

type PasswordRequirementsProps = {
  password: string;
  labels: {
    title: string;
    minLength: string;
    hasNumber: string;
    hasLetter: string;
  };
};

export function PasswordRequirements({
  password,
  labels,
}: PasswordRequirementsProps) {
  const checks = getPasswordChecks(password);
  const items = [
    { key: "minLength" as const, ok: checks.minLength, label: labels.minLength },
    { key: "hasLetter" as const, ok: checks.hasLetter, label: labels.hasLetter },
    { key: "hasNumber" as const, ok: checks.hasNumber, label: labels.hasNumber },
  ];

  const score = items.filter((item) => item.ok).length;

  return (
    <div className="space-y-1.5">
      <div aria-hidden className="grid grid-cols-3 gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1 rounded-full transition-colors duration-300",
              i >= score && "bg-slate-200",
              i < score && score === 3 && "bg-emerald-500",
              i < score && score === 2 && "bg-amber-400",
              i < score && score === 1 && "bg-rose-400",
            )}
          />
        ))}
      </div>
      <ul className="flex flex-wrap gap-1" aria-label={labels.title}>
        {items.map((item) => (
          <li
            key={item.key}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] leading-none transition-colors sm:px-2 sm:py-1 sm:text-[11px]",
              item.ok
                ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                : "border-border bg-muted/30 text-muted-foreground",
            )}
          >
            {item.ok ? (
              <Check className="size-3 shrink-0" aria-hidden />
            ) : (
              <span
                className="size-1.5 shrink-0 rounded-full bg-current opacity-40"
                aria-hidden
              />
            )}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
