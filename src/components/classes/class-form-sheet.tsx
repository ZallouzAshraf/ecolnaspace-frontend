"use client";

import { ClassForm } from "@/components/classes/class-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isRtlLocale } from "@/i18n/routing";
import type {
  AcademicYear,
  Campus,
  ClassRecord,
  CreateClassInput,
  UpdateClassInput,
} from "@/lib/api/types";
import { useLocale, useTranslations } from "next-intl";

type ClassFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campuses: Campus[];
  academicYears: AcademicYear[];
  classRecord?: ClassRecord | null;
  submitting?: boolean;
  onSubmit: (values: CreateClassInput | UpdateClassInput) => Promise<void>;
};

export function ClassFormSheet({
  open,
  onOpenChange,
  campuses,
  academicYears,
  classRecord,
  submitting,
  onSubmit,
}: ClassFormSheetProps) {
  const t = useTranslations("classes");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const isEdit = Boolean(classRecord);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={rtl ? "left" : "right"}
        className="flex w-full flex-col sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>{isEdit ? t("editTitle") : t("createTitle")}</SheetTitle>
          <SheetDescription>
            {isEdit ? t("editSubtitle") : t("createSubtitle")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          <ClassForm
            key={classRecord?.id ?? "new"}
            campuses={campuses}
            academicYears={academicYears}
            initial={classRecord}
            submitting={submitting}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
