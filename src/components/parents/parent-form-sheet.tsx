"use client";

import { ParentForm } from "@/components/parents/parent-form";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isRtlLocale } from "@/i18n/routing";
import type { CreateParentInput } from "@/lib/api/types";
import { useLocale, useTranslations } from "next-intl";

type ParentFormSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submitting?: boolean;
  onSubmit: (values: CreateParentInput) => Promise<void>;
};

export function ParentFormSheet({
  open,
  onOpenChange,
  submitting,
  onSubmit,
}: ParentFormSheetProps) {
  const t = useTranslations("parents");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={rtl ? "left" : "right"}
        className="flex w-full flex-col sm:max-w-lg"
      >
        <SheetHeader>
          <SheetTitle>{t("createTitle")}</SheetTitle>
          <SheetDescription>{t("createSubtitle")}</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-4">
          <ParentForm
            submitting={submitting}
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
