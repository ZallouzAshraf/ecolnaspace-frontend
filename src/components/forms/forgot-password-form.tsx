"use client";

import {
  AuthAlert,
  AuthDivider,
  AuthHeading,
  AuthSubmit,
} from "@/components/auth/auth-ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "@/i18n/navigation";
import { authApi } from "@/lib/api/auth";
import { ArrowLeft, KeyRound, MailCheck } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    setFormError(null);
    try {
      await authApi.forgotPassword(values.email);
      setSent(true);
    } catch (error) {
      const status =
        error && typeof error === "object" && "statusCode" in error
          ? Number((error as { statusCode: number }).statusCode)
          : undefined;
      if (status === 429) {
        setFormError(t("rateLimited"));
      } else {
        setSent(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  const backLink = (
    <Link
      href="/login"
      className="group inline-flex w-full items-center justify-center gap-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:text-slate-900"
    >
      <ArrowLeft
        className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:rotate-180 rtl:group-hover:translate-x-0.5"
        aria-hidden
      />
      {t("backToLogin")}
    </Link>
  );

  if (sent) {
    return (
      <div>
        <AuthHeading icon={MailCheck} title={t("forgotTitle")} />
        <AuthAlert tone="success" className="mt-6">
          {t("forgotSent")}
        </AuthAlert>
        <AuthDivider />
        {backLink}
      </div>
    );
  }

  return (
    <div>
      <AuthHeading
        icon={KeyRound}
        title={t("forgotTitle")}
        subtitle={t("forgotSubtitle")}
      />

      <form
        className="mt-7 flex flex-col gap-4"
        onSubmit={form.handleSubmit(onSubmit)}
        noValidate
      >
        {formError && <AuthAlert tone="error">{formError}</AuthAlert>}
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="forgot-email" className="text-[13px]">
            {t("email")}
          </Label>
          <Input
            id="forgot-email"
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="text-xs text-destructive" role="alert">
              {t("errors.email")}
            </p>
          )}
        </div>
        <AuthSubmit pending={submitting} pendingLabel={t("sending")}>
          {t("sendResetLink")}
        </AuthSubmit>
      </form>

      <AuthDivider />
      {backLink}
    </div>
  );
}
