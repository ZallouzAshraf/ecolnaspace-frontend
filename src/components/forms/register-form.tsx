"use client";

import {
  AuthAlert,
  AuthDivider,
  AuthHeading,
  AuthSubmit,
  authLinkClass,
} from "@/components/auth/auth-ui";
import { PasswordField } from "@/components/auth/password-field";
import { PasswordRequirements } from "@/components/auth/password-requirements";
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
import {
  organizationQueryKey,
  sessionQueryKey,
} from "@/components/providers/auth-provider";
import { Link, useRouter } from "@/i18n/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/types";
import { mapAuthError, passwordSchema } from "@/lib/auth/password";
import { Building2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const organizationTypes = [
  "GARDERIE",
  "PRIMARY_SCHOOL",
  "MIDDLE_SCHOOL",
  "HIGH_SCHOOL",
  "TUTORING_CENTER",
  "TRAINING_CENTER",
] as const;

function slugify(value: string): string {
  const base = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  if (base.length >= 2) return base;
  return `org-${Date.now().toString(36)}`;
}

const schema = z.object({
  organizationName: z.string().min(2).max(200),
  organizationType: z.enum(organizationTypes),
  adminFirstName: z.string().min(1).max(100),
  adminLastName: z.string().min(1).max(100),
  adminEmail: z.string().email(),
  adminPassword: passwordSchema,
  acceptTerms: z.boolean().refine((v) => v === true, { message: "required" }),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      organizationName: "",
      organizationType: "PRIMARY_SCHOOL",
      adminFirstName: "",
      adminLastName: "",
      adminEmail: "",
      adminPassword: "",
      acceptTerms: false,
    },
  });

  const password =
    useWatch({ control: form.control, name: "adminPassword" }) ?? "";

  const { ref: nameRegisterRef, ...nameRegister } =
    form.register("organizationName");

  useEffect(() => {
    nameRef.current?.focus();
  }, []);

  const typeOptions = useMemo(
    () =>
      organizationTypes.map((value) => ({
        value,
        label: t(`orgTypes.${value}`),
      })),
    [t],
  );

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      const { acceptTerms: _accept, ...rest } = values;
      await authApi.register({
        ...rest,
        organizationSlug: slugify(values.organizationName),
      });
      await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      await queryClient.invalidateQueries({ queryKey: organizationQueryKey });
      router.replace("/dashboard");
    } catch (error) {
      const status = error instanceof ApiError ? error.statusCode : undefined;
      const message =
        error instanceof ApiError ? error.message : t("registerFailed");
      setFormError(
        mapAuthError(status, message, {
          generic: t("registerFailed"),
          rateLimited: t("rateLimited"),
        }),
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="py-3.5">
      <AuthHeading
        compact
        icon={Building2}
        title={t("registerTitle")}
        subtitle={t("registerSubtitle")}
      />

      <form
        className="mt-3 flex flex-col gap-2"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {formError && <AuthAlert tone="error">{formError}</AuthAlert>}

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-1">
            <Label htmlFor="organizationName" className="text-xs">
              {t("organizationName")}
            </Label>
            <Input
              id="organizationName"
              className="h-9"
              autoComplete="organization"
              aria-invalid={Boolean(form.formState.errors.organizationName)}
              {...nameRegister}
              ref={(el) => {
                nameRegisterRef(el);
                nameRef.current = el;
              }}
            />
            {form.formState.errors.organizationName && (
              <p className="text-xs text-destructive" role="alert">
                {t("errors.organizationName")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <Label className="text-xs">{t("organizationType")}</Label>
            <Controller
              control={form.control}
              name="organizationType"
              render={({ field }) => (
                <>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger size="sm" className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {field.value === "GARDERIE" && (
                    <p className="text-[11px] leading-snug text-muted-foreground">
                      {t("orgTypeHints.GARDERIE")}
                    </p>
                  )}
                </>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="adminFirstName" className="text-xs">
              {t("firstName")}
            </Label>
            <Input
              id="adminFirstName"
              className="h-9"
              autoComplete="given-name"
              {...form.register("adminFirstName")}
            />
            {form.formState.errors.adminFirstName && (
              <p className="text-xs text-destructive" role="alert">
                {t("errors.firstName")}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="adminLastName" className="text-xs">
              {t("lastName")}
            </Label>
            <Input
              id="adminLastName"
              className="h-9"
              autoComplete="family-name"
              {...form.register("adminLastName")}
            />
            {form.formState.errors.adminLastName && (
              <p className="text-xs text-destructive" role="alert">
                {t("errors.lastName")}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="adminEmail" className="text-xs">
              {t("email")}
            </Label>
            <Input
              id="adminEmail"
              type="email"
              className="h-9"
              autoComplete="email"
              {...form.register("adminEmail")}
            />
            {form.formState.errors.adminEmail && (
              <p className="text-xs text-destructive" role="alert">
                {t("errors.email")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <PasswordField
              id="adminPassword"
              label={t("password")}
              className="h-9"
              autoComplete="new-password"
              showLabel={t("showPassword")}
              hideLabel={t("hidePassword")}
              describedBy="password-rules"
              error={
                form.formState.errors.adminPassword
                  ? t("errors.passwordWeak")
                  : undefined
              }
              {...form.register("adminPassword")}
            />
          </div>
        </div>

        <div id="password-rules">
          <PasswordRequirements
            password={password}
            labels={{
              title: t("passwordRules.title"),
              minLength: t("passwordRules.minLength"),
              hasLetter: t("passwordRules.hasLetter"),
              hasNumber: t("passwordRules.hasNumber"),
            }}
          />
        </div>

        <Controller
          control={form.control}
          name="acceptTerms"
          render={({ field, fieldState }) => (
            <div className="flex flex-col gap-1">
              <label className="flex cursor-pointer items-start gap-2 text-[12px] leading-snug">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(v) => field.onChange(v === true)}
                  className="mt-0.5"
                  aria-invalid={Boolean(fieldState.error)}
                />
                <span className="text-muted-foreground">
                  {t.rich("acceptTerms", {
                    privacy: (chunks) => (
                      <Link href="/privacy" className={authLinkClass}>
                        {chunks}
                      </Link>
                    ),
                    terms: (chunks) => (
                      <Link href="/terms" className={authLinkClass}>
                        {chunks}
                      </Link>
                    ),
                  })}
                </span>
              </label>
              {fieldState.error && (
                <p className="text-xs text-destructive" role="alert">
                  {t("errors.acceptTerms")}
                </p>
              )}
            </div>
          )}
        />

        <AuthSubmit pending={submitting} pendingLabel={t("creatingAccount")}>
          {t("createAccount")}
        </AuthSubmit>
      </form>

      <AuthDivider className="my-3" />

      <p className="text-center text-[12px] text-slate-500 sm:text-[13px]">
        {t("haveAccount")}{" "}
        <Link href="/login" className={authLinkClass}>
          {t("signIn")}
        </Link>
      </p>
    </div>
  );
}
