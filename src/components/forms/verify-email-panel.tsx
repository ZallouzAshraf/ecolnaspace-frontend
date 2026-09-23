"use client";

import { AuthAlert, AuthDivider, AuthHeading } from "@/components/auth/auth-ui";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/types";
import { Loader2, MailCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type Status = "idle" | "loading" | "success" | "error";

export function VerifyEmailPanel() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>(token ? "loading" : "idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    void (async () => {
      try {
        const result = await authApi.verifyEmail(token);
        if (!cancelled) {
          setStatus("success");
          setMessage(result.message);
        }
      } catch (error) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            error instanceof ApiError ? error.message : t("verifyError"),
          );
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token, t]);

  return (
    <div>
      <AuthHeading
        icon={MailCheck}
        title={t("verifyTitle")}
        subtitle={t("verifySubtitle")}
      />

      <div className="mt-6">
        {status === "loading" && (
          <AuthAlert tone="info">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              {t("verifying")}
            </span>
          </AuthAlert>
        )}
        {status === "success" && (
          <AuthAlert tone="success">{message || t("verifySuccess")}</AuthAlert>
        )}
        {status === "error" && <AuthAlert tone="error">{message}</AuthAlert>}
        {status === "idle" && (
          <AuthAlert tone="info">{t("verifyMissingToken")}</AuthAlert>
        )}
      </div>

      <AuthDivider />

      <Button
        asChild
        className="h-11 w-full rounded-xl bg-slate-900 text-[0.95rem] text-white hover:bg-slate-800"
      >
        <Link href="/login">{t("backToLogin")}</Link>
      </Button>
    </div>
  );
}
