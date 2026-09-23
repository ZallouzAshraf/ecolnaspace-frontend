"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type {
  Campus,
  CreateTeacherInput,
  Teacher,
  UpdateTeacherInput,
} from "@/lib/api/types";
import { emptyToUndefined } from "@/lib/format";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  email: z.string(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  phone: z.string().max(50).optional(),
  employeeCode: z.string().max(50).optional(),
  bio: z.string().max(2000).optional(),
  campusIds: z.array(z.string()),
});

type FormValues = z.infer<typeof formSchema>;

type TeacherFormProps = {
  campuses: Campus[];
  initial?: Teacher | null;
  submitting?: boolean;
  onSubmit: (values: CreateTeacherInput | UpdateTeacherInput) => Promise<void> | void;
  onCancel: () => void;
};

export function TeacherForm({
  campuses,
  initial,
  submitting,
  onSubmit,
  onCancel,
}: TeacherFormProps) {
  const t = useTranslations("teachers");
  const tCommon = useTranslations("common");
  const isEdit = Boolean(initial);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: initial?.email ?? "",
      firstName: initial?.firstName ?? "",
      lastName: initial?.lastName ?? "",
      phone: initial?.phone ?? "",
      employeeCode: initial?.employeeCode ?? "",
      bio: initial?.bio ?? "",
      campusIds: initial?.campusIds ?? [],
    },
  });

  async function handleSubmit(values: FormValues) {
    if (!isEdit) {
      const emailResult = z.email().safeParse(values.email.trim());
      if (!emailResult.success) {
        form.setError("email", { message: t("errors.email") });
        return;
      }
    }

    if (isEdit) {
      await onSubmit({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        phone: emptyToUndefined(values.phone),
        employeeCode: emptyToUndefined(values.employeeCode),
        bio: emptyToUndefined(values.bio),
        campusIds: values.campusIds,
      } satisfies UpdateTeacherInput);
      return;
    }

    await onSubmit({
      email: values.email.trim().toLowerCase(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: emptyToUndefined(values.phone),
      employeeCode: emptyToUndefined(values.employeeCode),
      bio: emptyToUndefined(values.bio),
      campusIds: values.campusIds.length ? values.campusIds : undefined,
    } satisfies CreateTeacherInput);
  }

  return (
    <form className="flex h-full flex-col" onSubmit={form.handleSubmit(handleSubmit)}>
      <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
        <section className="space-y-4">
          <h3 className="text-sm font-medium">{t("form.identity")}</h3>
          {!isEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("fields.email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-xs text-destructive">{t("errors.email")}</p>
              )}
              <p className="text-xs text-muted-foreground">{t("inviteHint")}</p>
            </div>
          )}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t("fields.phone")}</Label>
              <Input id="phone" {...form.register("phone")} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="employeeCode">{t("fields.employeeCode")}</Label>
              <Input id="employeeCode" {...form.register("employeeCode")} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="bio">{t("fields.bio")}</Label>
            <Textarea id="bio" rows={4} {...form.register("bio")} />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-sm font-medium">{t("form.campuses")}</h3>
          <p className="text-xs text-muted-foreground">{t("campusesHint")}</p>
          <Controller
            control={form.control}
            name="campusIds"
            render={({ field }) => (
              <div className="space-y-2 rounded-lg border border-border p-3">
                {campuses.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    {t("noCampuses")}
                  </p>
                ) : (
                  campuses.map((campus) => {
                    const checked = field.value.includes(campus.id);
                    return (
                      <label
                        key={campus.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(next) => {
                            if (next === true) {
                              field.onChange([...field.value, campus.id]);
                            } else {
                              field.onChange(
                                field.value.filter((id) => id !== campus.id),
                              );
                            }
                          }}
                        />
                        <span>{campus.name}</span>
                      </label>
                    );
                  })
                )}
              </div>
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
