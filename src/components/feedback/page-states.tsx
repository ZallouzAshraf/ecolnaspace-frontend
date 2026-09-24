"use client";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/types";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card px-6 py-8 text-center">
      <h2 className="text-sm font-medium text-foreground">{title}</h2>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

type ErrorStateProps = {
  message?: string;
  /** When set, 403 and 5xx are not rendered from the raw backend message. */
  error?: unknown;
  onRetry?: () => void;
};

export function ErrorState({ message, error, onRetry }: ErrorStateProps) {
  const t = useTranslations("common");
  let text = message ?? t("errorGeneric");
  if (error instanceof ApiError) {
    if (error.statusCode === 403) {
      text = t("forbidden");
    } else if (error.statusCode >= 500) {
      text = t("errorGeneric");
    } else {
      text = error.message || text;
    }
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 px-6 py-8 text-center">
      <p className="text-sm text-destructive">{text}</p>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRetry}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
