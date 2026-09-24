"use client";

import {
  AuthAlert,
  AuthDivider,
  AuthHeading,
  AuthSubmit,
  authLinkClass,
} from "@/components/auth/auth-ui";
import { PasswordField } from "@/components/auth/password-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  organizationQueryKey,
  sessionQueryKey,
} from "@/components/providers/auth-provider";
import { Link, useRouter } from "@/i18n/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/types";
import { mapAuthError, safeInternalPath } from "@/lib/auth/password";
import { LogIn } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  const { ref: emailRegisterRef, ...emailRegister } = form.register("email");

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const sessionExpired = searchParams.get("reason") === "session";
  const resetOk = searchParams.get("reset") === "1";

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      await authApi.login(values);
      await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      await queryClient.invalidateQueries({ queryKey: organizationQueryKey });
      router.replace(safeInternalPath(searchParams.get("next")));
    } catch (error) {
      const status = error instanceof ApiError ? error.statusCode : undefined;
      setFormError(
        mapAuthError(status, t("invalidCredentials"), {
          generic: t("invalidCredentials"),
          rateLimited: t("rateLimited"),
        }),
      );
      form.setValue("password", "");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <AuthHeading
        icon={LogIn}
        title={t("loginTitle")}
        subtitle={t("loginSubtitle")}
      />

      {sessionExpired && (
        <AuthAlert tone="warning" className="mt-5">
          {t("sessionExpired")}
        </AuthAlert>
      )}

      {resetOk && (
        <AuthAlert tone="success" className="mt-5">
          {t("resetSuccess")}
        </AuthAlert>
      )}

      <form
        className="mt-5 flex flex-col gap-3"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {formError && <AuthAlert tone="error">{formError}</AuthAlert>}

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email" className="text-[13px]">
            {t("email")}
          </Label>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            aria-describedby={
              form.formState.errors.email ? "login-email-error" : undefined
            }
            {...emailRegister}
            ref={(el) => {
              emailRegisterRef(el);
              emailRef.current = el;
            }}
          />
          {form.formState.errors.email && (
            <p id="login-email-error" className="text-xs text-destructive" role="alert">
              {t("errors.email")}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="login-password" className="text-[13px]">
              {t("password")}
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("forgotPassword")}
            </Link>
          </div>
          <PasswordField
            id="login-password"
            showLabel={t("showPassword")}
            hideLabel={t("hidePassword")}
            autoComplete="current-password"
            error={
              form.formState.errors.password
                ? t("errors.passwordRequired")
                : undefined
            }
            {...form.register("password")}
          />
        </div>

        <AuthSubmit pending={submitting} pendingLabel={t("signingIn")}>
          {t("signIn")}
        </AuthSubmit>
      </form>

      <AuthDivider />

      <p className="text-center text-[13px] text-slate-500">
        {t("noAccount")}{" "}
        <Link href="/register" className={authLinkClass}>
          {t("createOrganization")}
        </Link>
      </p>
    </div>
  );
}
