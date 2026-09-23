"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Campus, CampusInput } from "@/lib/api/types";
import { emptyToUndefined } from "@/lib/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(50).optional(),
  email: z.union([z.email(), z.literal("")]).optional(),
  phone: z.string().max(50).optional(),
  addressLine1: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  postalCode: z.string().max(20).optional(),
  country: z.string().max(2).optional(),
  isActive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

type CampusFormProps = {
  initial?: Campus | null;
  submitting?: boolean;
  onSubmit: (values: CampusInput) => Promise<void> | void;
  onCancel: () => void;
};

export function CampusForm({
  initial,
  submitting,
  onSubmit,
  onCancel,
}: CampusFormProps) {
  const t = useTranslations("campuses");
  const tCommon = useTranslations("common");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      code: initial?.code ?? "",
      email: initial?.email ?? "",
      phone: initial?.phone ?? "",
      addressLine1: initial?.addressLine1 ?? "",
      city: initial?.city ?? "",
      postalCode: initial?.postalCode ?? "",
      country: initial?.country ?? "",
      isActive: initial?.isActive ?? true,
    },
  });

  async function handleSubmit(values: FormValues) {
    await onSubmit({
      name: values.name.trim(),
      code: emptyToUndefined(values.code),
      email: emptyToUndefined(values.email),
      phone: emptyToUndefined(values.phone),
      addressLine1: emptyToUndefined(values.addressLine1),
      city: emptyToUndefined(values.city),
      postalCode: emptyToUndefined(values.postalCode),
      country: emptyToUndefined(values.country),
      isActive: values.isActive,
    });
  }

  return (
    <form className="flex h-full flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t("fields.name")}</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-xs text-destructive">{t("errors.name")}</p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="code">{t("fields.code")}</Label>
            <Input id="code" {...form.register("code")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">{t("fields.phone")}</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("fields.email")}</Label>
          <Input id="email" type="email" {...form.register("email")} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="addressLine1">{t("fields.addressLine1")}</Label>
          <Input id="addressLine1" {...form.register("addressLine1")} />
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
        <Controller
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
              {t("fields.isActive")}
            </label>
          )}
        />
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
