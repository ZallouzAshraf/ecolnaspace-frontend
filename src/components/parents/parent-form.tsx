"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateParentInput } from "@/lib/api/types";
import { emptyToUndefined } from "@/lib/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(50).optional(),
});

type FormValues = z.infer<typeof schema>;

type ParentFormProps = {
  submitting?: boolean;
  onSubmit: (values: CreateParentInput) => Promise<void> | void;
  onCancel: () => void;
};

export function ParentForm({ submitting, onSubmit, onCancel }: ParentFormProps) {
  const t = useTranslations("parents");
  const tCommon = useTranslations("common");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  async function handleSubmit(values: FormValues) {
    await onSubmit({
      email: values.email.trim().toLowerCase(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: emptyToUndefined(values.phone),
    });
  }

  return (
    <form className="flex h-full flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("fields.email")}</Label>
          <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive">{t("errors.email")}</p>
          )}
          <p className="text-xs text-muted-foreground">{t("inviteHint")}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="firstName">{t("fields.firstName")}</Label>
            <Input id="firstName" {...form.register("firstName")} />
            {form.formState.errors.firstName && (
              <p className="text-xs text-destructive">{t("errors.firstName")}</p>
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
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t("fields.phone")}</Label>
          <Input id="phone" {...form.register("phone")} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {tCommon("cancel")}
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? tCommon("loading") : t("inviteSubmit")}
        </Button>
      </div>
    </form>
  );
}
