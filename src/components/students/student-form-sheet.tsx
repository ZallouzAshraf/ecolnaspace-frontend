"use client";

import { StudentForm } from "@/components/students/student-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isRtlLocale } from "@/i18n/routing";
import type { Campus, Student, StudentInput } from "@/lib/api/types";
import { useLocale, useTranslations } from "next-intl";

type StudentFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campuses: Campus[];
  student?: Student | null;
  submitting?: boolean;
  canEditMedical?: boolean;
  onSubmit: (values: StudentInput) => Promise<void>;
};

export function StudentFormSheet({
  open,
  onOpenChange,
  campuses,
  student,
  submitting,
  canEditMedical,
  onSubmit,
}: StudentFormSheetProps) {
  const t = useTranslations("students");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const isEdit = Boolean(student);

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
          <StudentForm
            key={student?.id ?? "new"}
            campuses={campuses}
            initial={student}
            submitting={submitting}
            canEditMedical={canEditMedical}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
