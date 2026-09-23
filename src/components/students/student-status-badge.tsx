"use client";

import { Badge } from "@/components/ui/badge";
import type { StudentStatus } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

const statusClass: Record<StudentStatus, string> = {
  ACTIVE: "bg-success/15 text-success border-transparent",
  INACTIVE: "bg-muted text-muted-foreground border-transparent",
  GRADUATED: "bg-info/15 text-info border-transparent",
  WITHDRAWN: "bg-warning/15 text-warning border-transparent",
  ARCHIVED: "bg-secondary text-secondary-foreground border-transparent",
};

export function StudentStatusBadge({ status }: { status: StudentStatus }) {
  const t = useTranslations("students.status");
  return (
    <Badge variant="outline" className={cn("rounded-full", statusClass[status])}>
      {t(status)}
    </Badge>
  );
}
