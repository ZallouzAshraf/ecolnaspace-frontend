"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Campus, Student, StudentInput, StudentStatus } from "@/lib/api/types";
import { STUDENT_STATUSES } from "@/lib/api/types";
import { emptyToUndefined } from "@/lib/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  preferredName: z.string().max(100).optional(),
  dateOfBirth: z.string().min(1),
  gender: z.string().max(20).optional(),
  email: z.union([z.email(), z.literal("")]).optional(),
  phone: z.string().max(50).optional(),
  campusId: z.string().optional(),
  addressLine1: z.string().max(200).optional(),
  addressLine2: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(2).optional(),
  emergencyName: z.string().max(200).optional(),
  emergencyPhone: z.string().max(50).optional(),
  allergiesNote: z.string().max(2000).optional(),
  photoConsent: z.boolean(),
  status: z.enum(STUDENT_STATUSES),
  externalRef: z.string().max(100).optional(),
});

type FormValues = z.infer<typeof schema>;

type StudentFormProps = {
  campuses: Campus[];
  initial?: Student | null;
  submitting?: boolean;
  canEditMedical?: boolean;
  onSubmit: (values: StudentInput) => Promise<void> | void;
  onCancel: () => void;
};

function toDateInput(value: string): string {
  if (!value) return "";
  return value.slice(0, 10);
}

export function StudentForm({
  campuses,
  initial,
  submitting,
  canEditMedical = false,
  onSubmit,
  onCancel,
}: StudentFormProps) {
  const t = useTranslations("students");
  const tCommon = useTranslations("common");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: initial?.firstName ?? "",
      lastName: initial?.lastName ?? "",
      preferredName: initial?.preferredName ?? "",
      dateOfBirth: initial ? toDateInput(initial.dateOfBirth) : "",
      gender: initial?.gender ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      campusId: initial?.campusId ?? "",
      addressLine1: initial?.addressLine1 ?? "",
      addressLine2: initial?.addressLine2 ?? "",
      city: initial?.city ?? "",
      postalCode: initial?.postalCode ?? "",
      country: initial?.country ?? "",
      emergencyName: initial?.emergencyName ?? "",
      emergencyPhone: initial?.emergencyPhone ?? "",
      allergiesNote: initial?.allergiesNote ?? "",
      photoConsent: initial?.photoConsent ?? false,
      status: (initial?.status ?? "ACTIVE") as StudentStatus,
      externalRef: initial?.externalRef ?? "",
    },
  });

  async function handleSubmit(values: FormValues) {
    const payload: StudentInput = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      preferredName: emptyToUndefined(values.preferredName),
      dateOfBirth: values.dateOfBirth,
      gender: emptyToUndefined(values.gender),
      email: emptyToUndefined(values.email),
      phone: emptyToUndefined(values.phone),
      campusId: emptyToUndefined(values.campusId) ?? null,
      addressLine1: emptyToUndefined(values.addressLine1),
      addressLine2: emptyToUndefined(values.addressLine2),
      city: emptyToUndefined(values.city),
      postalCode: emptyToUndefined(values.postalCode),
      country: emptyToUndefined(values.country),
      emergencyName: emptyToUndefined(values.emergencyName),
      emergencyPhone: emptyToUndefined(values.emergencyPhone),
      photoConsent: values.photoConsent,
      status: values.status,
      externalRef: emptyToUndefined(values.externalRef),
    };

    if (canEditMedical) {
      payload.allergiesNote = emptyToUndefined(values.allergiesNote);
    }

    await onSubmit(payload);
  }

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={form.handleSubmit(handleSubmit)}
    >
      <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
        <section className="space-y-4">
          <h3 className="text-sm font-medium">{t("form.identity")}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{t("fields.firstName")}</Label>
              <Input id="firstName" {...form.register("firstName")} />
              {form.formState.errors.firstName && (
                <p className="text-xs text-destructive">
                  {t("errors.firstName")}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t("fields.lastName")}</Label>
              <Input id="lastName" {...form.register("lastName")} />
              {form.formState.errors.lastName && (
                <p className="text-xs text-destructive">{t("errors.lastName")}</p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="preferredName">{t("fields.preferredName")}</Label>
              <Input id="preferredName" {...form.register("preferredName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dateOfBirth">{t("fields.dateOfBirth")}</Label>
              <Input
                id="dateOfBirth"
                type="date"
                {...form.register("dateOfBirth")}
              />
              {form.formState.errors.dateOfBirth && (
                <p className="text-xs text-destructive">
                  {t("errors.dateOfBirth")}
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gender">{t("fields.gender")}</Label>
              <Input id="gender" {...form.register("gender")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("fields.status")}</Label>
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STUDENT_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {t(`status.${status}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium">{t("form.contact")}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("fields.email")}</Label>
              <Input id="email" type="email" {...form.register("email")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("fields.phone")}</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>{t("fields.campus")}</Label>
            <Controller
              control={form.control}
              name="campusId"
              render={({ field }) => (
                <Select
                  value={field.value || "__none__"}
                  onValueChange={(v) =>
                    field.onChange(v === "__none__" ? "" : v)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.campusPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      {t("fields.campusNone")}
                    </SelectItem>
                    {campuses.map((campus) => (
                      <SelectItem key={campus.id} value={campus.id}>
                        {campus.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium">{t("form.address")}</h3>
          <div className="space-y-1.5">
            <Label htmlFor="addressLine1">{t("fields.addressLine1")}</Label>
            <Input id="addressLine1" {...form.register("addressLine1")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="addressLine2">{t("fields.addressLine2")}</Label>
            <Input id="addressLine2" {...form.register("addressLine2")} />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="city">{t("fields.city")}</Label>
              <Input id="city" {...form.register("city")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postalCode">{t("fields.postalCode")}</Label>
              <Input id="postalCode" {...form.register("postalCode")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">{t("fields.country")}</Label>
              <Input id="country" {...form.register("country")} />
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium">{t("form.emergency")}</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="emergencyName">{t("fields.emergencyName")}</Label>
              <Input id="emergencyName" {...form.register("emergencyName")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="emergencyPhone">{t("fields.emergencyPhone")}</Label>
              <Input id="emergencyPhone" {...form.register("emergencyPhone")} />
            </div>
          </div>
        </section>

        {canEditMedical && (
          <section className="space-y-4">
            <h3 className="text-sm font-medium">{t("form.medical")}</h3>
            <div className="space-y-1.5">
              <Label htmlFor="allergiesNote">{t("fields.allergiesNote")}</Label>
              <Textarea id="allergiesNote" rows={3} {...form.register("allergiesNote")} />
            </div>
          </section>
        )}

        <section className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="externalRef">{t("fields.externalRef")}</Label>
            <Input id="externalRef" {...form.register("externalRef")} />
          </div>
          <Controller
            control={form.control}
            name="photoConsent"
            render={({ field }) => (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                {t("fields.photoConsent")}
              </label>
            )}
          />
        </section>
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
