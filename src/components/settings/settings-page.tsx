"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/types";
import type { OrganizationMe, UpdateOrganizationInput } from "@/lib/api/types";
import { organizationsApi } from "@/lib/api/resources";
import { emptyToUndefined } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export const settingsQueryKey = ["settings"] as const;

type OrgForm = {
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  timezone: string;
  locale: string;
};

function orgToForm(org: OrganizationMe): OrgForm {
  return {
    email: org.email ?? "",
    phone: org.phone ?? "",
    website: org.website ?? "",
    addressLine1: org.addressLine1 ?? "",
    addressLine2: org.addressLine2 ?? "",
    city: org.city ?? "",
    postalCode: org.postalCode ?? "",
    country: org.country ?? "",
    timezone: org.timezone ?? "",
    locale: org.locale ?? "",
  };
}

function OrganizationForm({
  org,
  canUpdate,
}: {
  org: OrganizationMe;
  canUpdate: boolean;
}) {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const [form, setForm] = useState<OrgForm>(() => orgToForm(org));

  const saveMutation = useMutation({
    mutationFn: (input: UpdateOrganizationInput) =>
      organizationsApi.updateMe(input),
    onSuccess: async () => {
      toast.success(t("toasts.updated"));
      await queryClient.invalidateQueries({
        queryKey: [...settingsQueryKey, "org"],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canUpdate) return;
    void saveMutation.mutateAsync({
      email: emptyToUndefined(form.email),
      phone: emptyToUndefined(form.phone),
      website: emptyToUndefined(form.website),
      addressLine1: emptyToUndefined(form.addressLine1),
      addressLine2: emptyToUndefined(form.addressLine2),
      city: emptyToUndefined(form.city),
      postalCode: emptyToUndefined(form.postalCode),
      country: emptyToUndefined(form.country),
      timezone: emptyToUndefined(form.timezone),
      locale: emptyToUndefined(form.locale),
    });
  }

  return (
    <form
      className="max-w-2xl space-y-4 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-base font-medium">{t("orgTitle")}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-email">{t("fields.email")}</Label>
          <Input
            id="org-email"
            type="email"
            value={form.email}
            disabled={!canUpdate}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-phone">{t("fields.phone")}</Label>
          <Input
            id="org-phone"
            value={form.phone}
            disabled={!canUpdate}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-website">{t("fields.website")}</Label>
          <Input
            id="org-website"
            value={form.website}
            disabled={!canUpdate}
            onChange={(e) =>
              setForm((f) => ({ ...f, website: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-address1">{t("fields.addressLine1")}</Label>
          <Input
            id="org-address1"
            value={form.addressLine1}
            disabled={!canUpdate}
            onChange={(e) =>
              setForm((f) => ({ ...f, addressLine1: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="org-address2">{t("fields.addressLine2")}</Label>
          <Input
            id="org-address2"
            value={form.addressLine2}
            disabled={!canUpdate}
            onChange={(e) =>
              setForm((f) => ({ ...f, addressLine2: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-city">{t("fields.city")}</Label>
          <Input
            id="org-city"
            value={form.city}
            disabled={!canUpdate}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-postal">{t("fields.postalCode")}</Label>
          <Input
            id="org-postal"
            value={form.postalCode}
            disabled={!canUpdate}
            onChange={(e) =>
              setForm((f) => ({ ...f, postalCode: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-country">{t("fields.country")}</Label>
          <Input
            id="org-country"
            value={form.country}
            disabled={!canUpdate}
            onChange={(e) =>
              setForm((f) => ({ ...f, country: e.target.value }))
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-tz">{t("fields.timezone")}</Label>
          <Input
            id="org-tz"
            value={form.timezone}
            disabled={!canUpdate}
            onChange={(e) =>
              setForm((f) => ({ ...f, timezone: e.target.value }))
            }
            placeholder="Africa/Casablanca"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="org-locale">{t("fields.locale")}</Label>
          <Input
            id="org-locale"
            value={form.locale}
            disabled={!canUpdate}
            onChange={(e) =>
              setForm((f) => ({ ...f, locale: e.target.value }))
            }
            placeholder="fr"
          />
        </div>
      </div>
      {canUpdate && (
        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending}>
            {tCommon("save")}
          </Button>
        </div>
      )}
    </form>
  );
}

export function SettingsPage() {
  const t = useTranslations("settings");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canUpdate =
    isSuperAdmin || permissions.includes("organizations.update");
  const canManageFeatures =
    isSuperAdmin || permissions.includes("features.manage");

  const orgQuery = useQuery({
    queryKey: [...settingsQueryKey, "org"],
    queryFn: () => organizationsApi.me(),
  });

  const featuresQuery = useQuery({
    queryKey: [...settingsQueryKey, "features"],
    queryFn: () => organizationsApi.listFeatures(),
    enabled: canManageFeatures || isSuperAdmin,
  });

  const featureMutation = useMutation({
    mutationFn: ({
      featureCode,
      enabled,
    }: {
      featureCode: string;
      enabled: boolean;
    }) => organizationsApi.updateFeature(featureCode, enabled),
    onSuccess: async () => {
      toast.success(t("toasts.featureUpdated"));
      await queryClient.invalidateQueries({
        queryKey: [...settingsQueryKey, "features"],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  if (orgQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (orgQuery.isError) {
    return (
      <ErrorState
        message={
          orgQuery.error instanceof ApiError
            ? orgQuery.error.message
            : undefined
        }
        onRetry={() => void orgQuery.refetch()}
      />
    );
  }

  const org = orgQuery.data;
  if (!org) {
    return <EmptyState title={t("notFound")} />;
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        <p className="mt-2 text-sm font-medium">
          {org.name}{" "}
          <span className="font-normal text-muted-foreground">
            ({org.slug})
          </span>
        </p>
      </div>

      <OrganizationForm key={org.updatedAt} org={org} canUpdate={canUpdate} />

      {canManageFeatures && (
        <section className="max-w-2xl space-y-3 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
          <div>
            <h2 className="text-base font-medium">{t("featuresTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("featuresSubtitle")}
            </p>
          </div>
          {featuresQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : featuresQuery.isError ? (
            <ErrorState
              message={
                featuresQuery.error instanceof ApiError
                  ? featuresQuery.error.message
                  : undefined
              }
              onRetry={() => void featuresQuery.refetch()}
            />
          ) : (featuresQuery.data ?? []).length === 0 ? (
            <EmptyState title={t("featuresEmpty")} />
          ) : (
            <ul className="space-y-2">
              {(featuresQuery.data ?? []).map((feature) => (
                <li
                  key={feature.featureCode}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                >
                  <span className="text-sm font-medium">
                    {feature.featureCode}
                  </span>
                  <label className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={feature.enabled}
                      disabled={featureMutation.isPending}
                      onCheckedChange={(v) =>
                        featureMutation.mutate({
                          featureCode: feature.featureCode,
                          enabled: v === true,
                        })
                      }
                    />
                    {feature.enabled
                      ? t("features.enabled")
                      : t("features.disabled")}
                  </label>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
