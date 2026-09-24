"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";
import {
  onConsentPreferencesRequested,
  parseConsent,
  readConsentRaw,
  saveConsent,
  subscribeConsent,
} from "@/lib/consent";
import { Cookie } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const SERVER_SNAPSHOT = "__server__";

export function CookieConsent() {
  const t = useTranslations("marketing.cookieBanner");
  const raw = useSyncExternalStore(
    subscribeConsent,
    readConsentRaw,
    () => SERVER_SNAPSHOT,
  );
  const decided = raw === SERVER_SNAPSHOT ? true : parseConsent(raw) !== null;
  const current = raw === SERVER_SNAPSHOT ? null : parseConsent(raw);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [preferences, setPreferences] = useState(false);

  useEffect(
    () =>
      onConsentPreferencesRequested(() => {
        setPreferences(parseConsent(readConsentRaw())?.preferences ?? false);
        setDialogOpen(true);
      }),
    [],
  );

  function openDialog() {
    setPreferences(current?.preferences ?? false);
    setDialogOpen(true);
  }

  function decide(nextPreferences: boolean) {
    saveConsent({ preferences: nextPreferences });
    setDialogOpen(false);
  }

  return (
    <>
      {!decided && !dialogOpen ? (
        <div
          role="region"
          aria-label={t("regionLabel")}
          className="fixed inset-x-3 bottom-3 z-[60] sm:inset-x-auto sm:start-4 sm:bottom-4 sm:max-w-md motion-safe:animate-[fade-up_0.5s_cubic-bezier(0.22,1,0.36,1)_both]"
        >
          <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_60px_-24px_rgba(15,23,42,0.45)] backdrop-blur-xl">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Cookie className="size-4.5" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-950">{t("title")}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-slate-600">
                  {t("body")}{" "}
                  <Link href="/cookies" className="font-medium text-primary underline-offset-2 hover:underline">
                    {t("policyLink")}
                  </Link>
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => decide(false)}
              >
                {t("reject")}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => decide(true)}
              >
                {t("accept")}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="col-span-2 rounded-full text-slate-600"
                onClick={openDialog}
              >
                {t("manage")}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("dialogTitle")}</DialogTitle>
            <DialogDescription>{t("dialogBody")}</DialogDescription>
          </DialogHeader>

          <ul className="space-y-3">
            <CategoryRow
              title={t("categories.necessary.title")}
              body={t("categories.necessary.body")}
              status={t("alwaysOn")}
            >
              <Checkbox checked disabled aria-label={t("categories.necessary.title")} />
            </CategoryRow>
            <CategoryRow
              title={t("categories.preferences.title")}
              body={t("categories.preferences.body")}
            >
              <Checkbox
                id="consent-preferences"
                checked={preferences}
                onCheckedChange={(value) => setPreferences(value === true)}
                aria-label={t("categories.preferences.title")}
              />
            </CategoryRow>
            <CategoryRow
              title={t("categories.analytics.title")}
              body={t("categories.analytics.body")}
              status={t("notUsed")}
            />
            <CategoryRow
              title={t("categories.marketing.title")}
              body={t("categories.marketing.body")}
              status={t("notUsed")}
            />
          </ul>

          <DialogFooter className="gap-2 sm:justify-between">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => decide(false)}>
              {t("reject")}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => decide(true)}>
                {t("accept")}
              </Button>
              <Button type="button" className="rounded-full" onClick={() => decide(preferences)}>
                {t("save")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CategoryRow({
  title,
  body,
  status,
  children,
}: {
  title: string;
  body: string;
  status?: string;
  children?: ReactNode;
}) {
  return (
    <li className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-muted/30 p-3.5">
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2 pt-0.5">
        {status ? (
          <span className="text-[11px] font-medium text-muted-foreground">{status}</span>
        ) : null}
        {children}
      </div>
    </li>
  );
}
