"use client";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "@/i18n/navigation";
import {
  contactApi,
  ESTABLISHMENT_TYPES,
  type EstablishmentType,
} from "@/lib/api/contact";
import { ApiError } from "@/lib/api/types";
import { SITE } from "@/lib/site-config";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

export type ContactTopic = "demo" | "quote" | "general";

const PHONE_PATTERN = /^[+0-9 ().-]{6,30}$/;

function buildSchema(t: (key: string) => string) {
  return z.object({
    fullName: z
      .string()
      .trim()
      .min(2, t("errors.fullName"))
      .max(120, t("errors.fullNameLong")),
    email: z.string().trim().email(t("errors.email")).max(254, t("errors.email")),
    organizationName: z
      .string()
      .trim()
      .min(2, t("errors.organizationName"))
      .max(160, t("errors.organizationNameLong")),
    establishmentType: z.enum(ESTABLISHMENT_TYPES, {
      error: t("errors.establishmentType"),
    }),
    phone: z
      .string()
      .trim()
      .refine((value) => value === "" || PHONE_PATTERN.test(value), t("errors.phone")),
    message: z
      .string()
      .trim()
      .min(10, t("errors.messageShort"))
      .max(4000, t("errors.messageLong")),
    website: z.string(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildSchema>>;

export function ContactForm({ topic }: { topic: ContactTopic }) {
  const t = useTranslations("marketing.contact.form");
  const locale = useLocale();
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [formError, setFormError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(buildSchema(t)),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      organizationName: "",
      establishmentType: undefined as unknown as EstablishmentType,
      phone: "",
      message: topic === "general" ? "" : t(`prefill.${topic}`),
      website: "",
    },
  });

  const { errors, isSubmitting } = form.formState;

  async function onSubmit(values: FormValues) {
    setFormError(null);
    try {
      await contactApi.submit({
        fullName: values.fullName,
        email: values.email,
        organizationName: values.organizationName,
        establishmentType: values.establishmentType,
        phone: values.phone || undefined,
        message: values.message,
        locale,
        website: values.website,
      });
      setStatus("sent");
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 429) {
        setFormError(t("errors.rateLimited"));
      } else if (error instanceof ApiError && error.statusCode === 400) {
        setFormError(t("errors.invalid"));
      } else {
        setFormError(t("errors.network", { email: SITE.contactEmail }));
      }
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center py-10 text-center" role="status">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
          <CheckCircle2 className="size-7" aria-hidden />
        </span>
        <h3 className="mt-6 text-xl font-semibold tracking-tight text-slate-950">
          {t("success.title")}
        </h3>
        <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-slate-600">
          {t("success.body")}
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-7 rounded-full"
          onClick={() => {
            form.reset();
            setStatus("idle");
          }}
        >
          {t("success.again")}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {formError ? (
        <p
          role="alert"
          className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {formError}
        </p>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label={t("fullName")} htmlFor="contact-name" error={errors.fullName?.message}>
          <Input
            id="contact-name"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            {...form.register("fullName")}
          />
        </FormField>
        <FormField label={t("email")} htmlFor="contact-email" error={errors.email?.message}>
          <Input
            id="contact-email"
            type="email"
            dir="ltr"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            {...form.register("email")}
          />
        </FormField>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          label={t("organizationName")}
          htmlFor="contact-org"
          error={errors.organizationName?.message}
        >
          <Input
            id="contact-org"
            autoComplete="organization"
            aria-invalid={Boolean(errors.organizationName)}
            {...form.register("organizationName")}
          />
        </FormField>
        <FormField
          label={t("establishmentType")}
          htmlFor="contact-type"
          error={errors.establishmentType?.message}
        >
          <Controller
            control={form.control}
            name="establishmentType"
            render={({ field }) => (
              <Select
                value={field.value ?? ""}
                onValueChange={(value) => field.onChange(value as EstablishmentType)}
              >
                <SelectTrigger
                  id="contact-type"
                  className="w-full"
                  aria-invalid={Boolean(errors.establishmentType)}
                  onBlur={field.onBlur}
                >
                  <SelectValue placeholder={t("establishmentPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {ESTABLISHMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>
      </div>

      <FormField
        label={
          <>
            {t("phone")} <span className="font-normal text-muted-foreground">({t("optional")})</span>
          </>
        }
        htmlFor="contact-phone"
        error={errors.phone?.message}
        hint={t("phoneHint")}
      >
        <Input
          id="contact-phone"
          type="tel"
          dir="ltr"
          autoComplete="tel"
          inputMode="tel"
          aria-invalid={Boolean(errors.phone)}
          {...form.register("phone")}
        />
      </FormField>

      <FormField label={t("message")} htmlFor="contact-message" error={errors.message?.message}>
        <Textarea
          id="contact-message"
          rows={6}
          placeholder={t("messagePlaceholder")}
          aria-invalid={Boolean(errors.message)}
          {...form.register("message")}
        />
      </FormField>

      {/* Honeypot: invisible to people and assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -start-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...form.register("website")}
        />
      </div>

      <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-sm text-xs leading-relaxed text-slate-500">
          {t.rich("privacyNotice", {
            link: (chunks) => (
              <Link href="/privacy" className="font-medium text-primary hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="h-11 shrink-0 rounded-full px-6"
        >
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Send className="size-4 rtl:-scale-x-100" aria-hidden />
          )}
          {isSubmitting ? t("sending") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
