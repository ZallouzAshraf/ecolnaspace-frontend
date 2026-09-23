"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
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
import { formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export const activitiesQueryKey = ["daycare", "activities"] as const;

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function ActivitiesPage() {
  const t = useTranslations("activities");
  const tCommon = useTranslations("common");
  const rtl = isRtlLocale(useLocale());
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canManage =
    isSuperAdmin || permissions.includes("daycare.activities.manage");

  const [date, setDate] = useState(todayDateString);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [studentIds, setStudentIds] = useState<string[]>([]);

  const listQuery = useQuery({
    queryKey: [...activitiesQueryKey, date],
    queryFn: () => daycareApi.listActivities({ date, page: 1 }),
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "options"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: sheetOpen,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      daycareApi.createActivity({
        title: title.trim(),
        date,
        notes: notes.trim() || undefined,
        studentIds,
      }),
    onSuccess: async () => {
      toast.success(t("toasts.created"));
      setSheetOpen(false);
      setTitle("");
      setNotes("");
      setStudentIds([]);
      await queryClient.invalidateQueries({ queryKey: activitiesQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function toggleStudent(id: string) {
    setStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || studentIds.length === 0) {
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
        <Label htmlFor="activities-date">{t("filters.date")}</Label>
        <Input
          id="activities-date"
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
                <TableHead>{t("columns.title")}</TableHead>
                <TableHead>{t("columns.students")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("columns.notes")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell className="font-medium">{activity.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {(activity.students ?? [])
                      .map((s) => formatPersonName(s.firstName, s.lastName))
                      .join(", ") || "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {activity.notes || "—"}
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
                <Label htmlFor="act-title">{t("fields.title")}</Label>
                <Input
                  id="act-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>{t("fields.students")}</Label>
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  {(studentsQuery.data?.data ?? []).map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={studentIds.includes(student.id)}
                        onCheckedChange={() => toggleStudent(student.id)}
                      />
                      {formatPersonName(student.firstName, student.lastName)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="act-notes">{t("fields.notes")}</Label>
                <Textarea
                  id="act-notes"
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
