"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { isRtlLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/types";
import type { Announcement, AnnouncementInput } from "@/lib/api/types";
import { announcementsApi } from "@/lib/api/resources";
import { formatDate } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export const announcementsQueryKey = ["announcements"] as const;

export function AnnouncementsPage() {
  const t = useTranslations("announcements");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canManage =
    isSuperAdmin || permissions.includes("communications.manage");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [publishNow, setPublishNow] = useState(true);

  const listQuery = useQuery({
    queryKey: announcementsQueryKey,
    queryFn: () => announcementsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (input: AnnouncementInput) => announcementsApi.create(input),
    onSuccess: async () => {
      toast.success(t("toasts.created"));
      setSheetOpen(false);
      setTitle("");
      setBody("");
      setPublishNow(true);
      await queryClient.invalidateQueries({ queryKey: announcementsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const unpublishMutation = useMutation({
    mutationFn: (id: string) =>
      announcementsApi.update(id, { publishedAt: null }),
    onSuccess: async () => {
      toast.success(t("toasts.unpublished"));
      await queryClient.invalidateQueries({ queryKey: announcementsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error(t("errors.required"));
      return;
    }
    void createMutation.mutateAsync({
      title: title.trim(),
      body: body.trim(),
      publishedAt: publishNow ? new Date().toISOString() : undefined,
    });
  }

  const rows = listQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {canManage && (
          <Button
            type="button"
            onClick={() => {
              setTitle("");
              setBody("");
              setPublishNow(true);
              setSheetOpen(true);
            }}
          >
            <Plus className="size-4" />
            {t("add")}
          </Button>
        )}
      </div>

      {listQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : listQuery.isError ? (
        <ErrorState
          message={
            listQuery.error instanceof ApiError
              ? listQuery.error.message
              : undefined
          }
          onRetry={() => void listQuery.refetch()}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            canManage ? (
              <Button type="button" onClick={() => setSheetOpen(true)}>
                <Plus className="size-4" />
                {t("add")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <ul className="space-y-3">
          {rows.map((item: Announcement) => (
            <li
              key={item.id}
              className="rounded-xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-medium">{item.title}</h2>
                    <Badge variant="outline" className="rounded-full">
                      {t("status.published")}
                    </Badge>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {formatDate(item.publishedAt, locale, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                {canManage && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={unpublishMutation.isPending}
                    onClick={() => unpublishMutation.mutate(item.id)}
                  >
                    {t("actions.unpublish")}
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side={rtl ? "left" : "right"}
          className="flex w-full flex-col sm:max-w-lg"
        >
          <SheetHeader>
            <SheetTitle>{t("createTitle")}</SheetTitle>
            <SheetDescription>{t("createSubtitle")}</SheetDescription>
          </SheetHeader>
          <form
            className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4"
            onSubmit={handleSubmit}
          >
            <div className="flex-1 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <Label htmlFor="ann-title">{t("fields.title")}</Label>
                <Input
                  id="ann-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ann-body">{t("fields.body")}</Label>
                <Textarea
                  id="ann-body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={publishNow}
                  onCheckedChange={(v) => setPublishNow(v === true)}
                />
                {t("fields.publishNow")}
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {tCommon("save")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
