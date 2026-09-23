"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { isRtlLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/types";
import { daycareApi, studentsApi } from "@/lib/api/resources";
import { formatDate, formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export const napsQueryKey = ["daycare", "naps"] as const;

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toIsoFromDateTimeLocal(value: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

export function NapsPage() {
  const t = useTranslations("naps");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canManage =
    isSuperAdmin || permissions.includes("daycare.naps.manage");

  const [date, setDate] = useState(todayDateString);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [startedAt, setStartedAt] = useState("");
  const [endedAt, setEndedAt] = useState("");
  const [notes, setNotes] = useState("");

  const listQuery = useQuery({
    queryKey: [...napsQueryKey, date],
    queryFn: () => daycareApi.listNaps({ date, page: 1 }),
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "options"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: sheetOpen,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const started = toIsoFromDateTimeLocal(startedAt);
      if (!started) throw new Error("invalid_start");
      return daycareApi.createNap({
        studentId,
        date,
        startedAt: started,
        endedAt: toIsoFromDateTimeLocal(endedAt),
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: async () => {
      toast.success(t("toasts.created"));
      setSheetOpen(false);
      setStudentId("");
      setStartedAt("");
      setEndedAt("");
      setNotes("");
      await queryClient.invalidateQueries({ queryKey: napsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !startedAt) {
      toast.error(t("errors.required"));
      return;
    }
    void createMutation.mutateAsync();
  }

  const rows = listQuery.data?.data ?? [];

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
          <Button type="button" onClick={() => setSheetOpen(true)}>
            <Plus className="size-4" />
            {t("add")}
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:w-44">
        <Label htmlFor="naps-date">{t("filters.date")}</Label>
        <Input
          id="naps-date"
          type="date"
          className="mt-1.5"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {listQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
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
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.student")}</TableHead>
                <TableHead>{t("columns.startedAt")}</TableHead>
                <TableHead>{t("columns.endedAt")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("columns.notes")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((nap) => (
                <TableRow key={nap.id}>
                  <TableCell className="font-medium">
                    {nap.student
                      ? formatPersonName(
                          nap.student.firstName,
                          nap.student.lastName,
                        )
                      : nap.studentId}
                  </TableCell>
                  <TableCell>
                    {formatDate(nap.startedAt, locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>
                    {nap.endedAt
                      ? formatDate(nap.endedAt, locale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {nap.notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
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
                <Label>{t("fields.student")}</Label>
                <Select value={studentId || undefined} onValueChange={setStudentId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.studentPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(studentsQuery.data?.data ?? []).map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {formatPersonName(student.firstName, student.lastName)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nap-start">{t("fields.startedAt")}</Label>
                <Input
                  id="nap-start"
                  type="datetime-local"
                  value={startedAt}
                  onChange={(e) => setStartedAt(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nap-end">{t("fields.endedAt")}</Label>
                <Input
                  id="nap-end"
                  type="datetime-local"
                  value={endedAt}
                  onChange={(e) => setEndedAt(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nap-notes">{t("fields.notes")}</Label>
                <Textarea
                  id="nap-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
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
