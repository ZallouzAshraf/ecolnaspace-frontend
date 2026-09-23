"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  AcademicYear,
  Campus,
  ClassRecord,
  CreateClassInput,
  UpdateClassInput,
} from "@/lib/api/types";
import { emptyToUndefined } from "@/lib/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  campusId: z.string().optional(),
  academicYearId: z.string().optional(),
  name: z.string().min(1).max(200),
  gradeLevel: z.string().max(50).optional(),
  capacity: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type ClassFormProps = {
  campuses: Campus[];
  academicYears: AcademicYear[];
  initial?: ClassRecord | null;
  submitting?: boolean;
  onSubmit: (values: CreateClassInput | UpdateClassInput) => Promise<void> | void;
  onCancel: () => void;
};

export function ClassForm({
  campuses,
  academicYears,
  initial,
  submitting,
  onSubmit,
  onCancel,
}: ClassFormProps) {
  const t = useTranslations("classes");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(initial);

  const currentYear =
    academicYears.find((y) => y.isCurrent)?.id ?? academicYears[0]?.id ?? "";

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      campusId: initial?.campusId ?? campuses[0]?.id ?? "",
      academicYearId: initial?.academicYearId ?? currentYear,
      name: initial?.name ?? "",
      gradeLevel: initial?.gradeLevel ?? "",
      capacity: initial?.capacity != null ? String(initial.capacity) : "",
    },
  });

  async function handleSubmit(values: FormValues) {
    const capacityRaw = values.capacity?.trim();
    const capacity =
      capacityRaw && !Number.isNaN(Number(capacityRaw))
        ? Number(capacityRaw)
        : undefined;

    if (isEdit) {
      await onSubmit({
        name: values.name.trim(),
        gradeLevel: emptyToUndefined(values.gradeLevel),
        capacity,
      } satisfies UpdateClassInput);
      return;
    }

    if (!values.campusId || !values.academicYearId) {
      if (!values.campusId) form.setError("campusId", { message: "required" });
      if (!values.academicYearId) {
        form.setError("academicYearId", { message: "required" });
      }
      return;
    }

    await onSubmit({
      campusId: values.campusId,
      academicYearId: values.academicYearId,
      name: values.name.trim(),
      gradeLevel: emptyToUndefined(values.gradeLevel),
      capacity,
    } satisfies CreateClassInput);
  }

  return (
    <form className="flex h-full flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
        {!isEdit && (
          <>
            <div className="space-y-1.5">
              <Label>{t("fields.campus")}</Label>
              <Controller
                control={form.control}
                name="campusId"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("fields.campusPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {campuses.map((campus) => (
                        <SelectItem key={campus.id} value={campus.id}>
                          {campus.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.campusId && (
                <p className="text-xs text-destructive">{t("errors.campus")}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("fields.academicYear")}</Label>
              <Controller
                control={form.control}
                name="academicYearId"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("fields.yearPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {academicYears.map((year) => (
                        <SelectItem key={year.id} value={year.id}>
                          {year.name}
                          {year.isCurrent ? ` (${t("currentYear")})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.academicYearId && (
                <p className="text-xs text-destructive">{t("errors.year")}</p>
              )}
            </div>
          </>
        )}

        {isEdit && initial && (
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            {initial.campus.name} · {initial.academicYear.name}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="name">{t("fields.name")}</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{t("errors.name")}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="gradeLevel">{t("fields.gradeLevel")}</Label>
            <Input id="gradeLevel" {...form.register("gradeLevel")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="capacity">{t("fields.capacity")}</Label>
            <Input id="capacity" type="number" min={1} {...form.register("capacity")} />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? tCommon("loading") : tCommon("save")}
        </Button>
      </div>
    </form>
  );
}
