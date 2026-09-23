"use client";

import { CampusForm } from "@/components/campuses/campus-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isRtlLocale } from "@/i18n/routing";
import type { Campus, CampusInput } from "@/lib/api/types";
import { useLocale, useTranslations } from "next-intl";

type CampusFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campus?: Campus | null;
  submitting?: boolean;
  onSubmit: (values: CampusInput) => Promise<void>;
};

export function CampusFormSheet({
  open,
  onOpenChange,
  campus,
  submitting,
  onSubmit,
}: CampusFormSheetProps) {
  const t = useTranslations("campuses");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const isEdit = Boolean(campus);

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
          <CampusForm
            key={campus?.id ?? "new"}
            initial={campus}
            submitting={submitting}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
