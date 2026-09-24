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
import { Link, useRouter } from "@/i18n/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/types";
import { mapAuthError, passwordSchema } from "@/lib/auth/password";
import { cn } from "@/lib/utils";
import { LockKeyhole, ShieldAlert } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "mismatch",
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const password = useWatch({ control: form.control, name: "newPassword" }) ?? "";

  if (!token) {
    return (
      <div>
        <AuthHeading icon={ShieldAlert} title={t("resetTitle")} />
        <AuthAlert tone="error" className="mt-6">
          {t("resetInvalidToken")}
        </AuthAlert>
        <AuthDivider />
        <Link
          href="/forgot-password"
          className={cn(authLinkClass, "block text-center text-sm")}
        >
          {t("requestNewReset")}
        </Link>
      </div>
    );
  }

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      await authApi.resetPassword(token, values.newPassword);
      router.replace("/login?reset=1");
    } catch (error) {
      const status = error instanceof ApiError ? error.statusCode : undefined;
      if (status === 400 || status === 401 || status === 404) {
        setFormError(t("resetInvalidToken"));
      } else {
        setFormError(
          mapAuthError(status, t("resetFailed"), {
            generic: t("resetFailed"),
            rateLimited: t("rateLimited"),
          }),
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AuthHeading
        icon={LockKeyhole}
        title={t("resetTitle")}
        subtitle={t("resetSubtitle")}
      />

      <form
        className="mt-7 flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {formError && <AuthAlert tone="error">{formError}</AuthAlert>}

        <PasswordField
          id="newPassword"
          label={t("newPassword")}
          autoComplete="new-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
          describedBy="reset-password-rules"
          error={
            form.formState.errors.newPassword
              ? t("errors.passwordWeak")
              : undefined
          }
          {...form.register("newPassword")}
        />
        <div id="reset-password-rules">
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

        <PasswordField
          id="confirmPassword"
          label={t("confirmPassword")}
          autoComplete="new-password"
          showLabel={t("showPassword")}
          hideLabel={t("hidePassword")}
          error={
            form.formState.errors.confirmPassword
              ? t("errors.passwordMismatch")
              : undefined
          }
          {...form.register("confirmPassword")}
        />

        <AuthSubmit pending={submitting} pendingLabel={t("resetting")}>
          {t("resetSubmit")}
        </AuthSubmit>
      </form>

      <AuthDivider />

      <Link
        href="/login"
        className="block text-center text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
      >
        {t("backToLogin")}
      </Link>
    </div>
  );
}
