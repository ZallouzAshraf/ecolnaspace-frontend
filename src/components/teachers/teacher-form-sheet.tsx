"use client";

import { TeacherForm } from "@/components/teachers/teacher-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isRtlLocale } from "@/i18n/routing";
import type {
  Campus,
  CreateTeacherInput,
  Teacher,
  UpdateTeacherInput,
} from "@/lib/api/types";
import { useLocale, useTranslations } from "next-intl";

type TeacherFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campuses: Campus[];
  teacher?: Teacher | null;
  submitting?: boolean;
  onSubmit: (
    values: CreateTeacherInput | UpdateTeacherInput,
  ) => Promise<void>;
};

export function TeacherFormSheet({
  open,
  onOpenChange,
  campuses,
  teacher,
  submitting,
  onSubmit,
}: TeacherFormSheetProps) {
  const t = useTranslations("teachers");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const isEdit = Boolean(teacher);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={rtl ? "left" : "right"}
        className="flex w-full flex-col sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>
            {isEdit ? t("editTitle") : t("createTitle")}
          </SheetTitle>
          <SheetDescription>
            {isEdit ? t("editSubtitle") : t("createSubtitle")}
          </SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          <TeacherForm
            key={teacher?.id ?? "new"}
            campuses={campuses}
            initial={teacher}
            submitting={submitting}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
