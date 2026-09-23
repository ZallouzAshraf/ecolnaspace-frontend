"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { isRtlLocale } from "@/i18n/routing";
import { classesApi, examsApi, subjectsApi } from "@/lib/api/resources";
import { ApiError } from "@/lib/api/types";
import type { Exam, ExamInput } from "@/lib/api/types";
import { emptyToUndefined, formatDate } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

const ALL = "__all__";

export function ExamsPage() {
  const t = useTranslations("exams");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canManage = isSuperAdmin || permissions.includes("exams.manage");

  const [classFilter, setClassFilter] = useState(ALL);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Exam | null>(null);
  const [deleting, setDeleting] = useState<Exam | null>(null);

  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [durationMin, setDurationMin] = useState("");
  const [status, setStatus] = useState("SCHEDULED");
  const [formError, setFormError] = useState<string | null>(null);

  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesApi.list(),
    staleTime: 60_000,
  });

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsApi.list(),
    staleTime: 60_000,
  });

  const listQuery = useQuery({
    queryKey: ["exams", classFilter],
    queryFn: () =>
      examsApi.list({
        classId: classFilter === ALL ? undefined : classFilter,
        pageSize: 50,
      }),
  });

  function openCreate() {
    setEditing(null);
    setClassId(classFilter !== ALL ? classFilter : classesQuery.data?.[0]?.id ?? "");
    setSubjectId(subjectsQuery.data?.[0]?.id ?? "");
    setTitle("");
    setExamDate("");
    setDurationMin("");
    setStatus("SCHEDULED");
    setFormError(null);
    setSheetOpen(true);
  }

  function openEdit(item: Exam) {
    setEditing(item);
    setClassId(item.classId);
    setSubjectId(item.subjectId);
    setTitle(item.title);
    setExamDate(item.examDate.slice(0, 10));
    setDurationMin(item.durationMin != null ? String(item.durationMin) : "");
    setStatus(item.status || "SCHEDULED");
    setFormError(null);
    setSheetOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: async (input: ExamInput) => {
      if (editing) {
        return examsApi.update(editing.id, {
          title: input.title,
          examDate: input.examDate,
          durationMin: input.durationMin,
          status: input.status,
          subjectId: input.subjectId,
        });
      }
      return examsApi.create(input);
    },
    onSuccess: async () => {
      toast.success(editing ? t("toasts.updated") : t("toasts.created"));
      setSheetOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examsApi.remove(id),
    onSuccess: async () => {
      toast.success(t("toasts.deleted"));
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing && !classId) {
      setFormError(t("errors.class"));
      return;
    }
    if (!subjectId) {
      setFormError(t("errors.subject"));
      return;
    }
    if (!title.trim()) {
      setFormError(t("errors.title"));
      return;
    }
    if (!examDate) {
      setFormError(t("errors.examDate"));
      return;
    }
    setFormError(null);
    const durationRaw = durationMin.trim();
    const duration =
      durationRaw && !Number.isNaN(Number(durationRaw))
        ? Number(durationRaw)
        : undefined;

    void saveMutation.mutateAsync({
      classId: editing?.classId ?? classId,
      subjectId,
      title: title.trim(),
      examDate,
      durationMin: duration,
      status: emptyToUndefined(status),
    });
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
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            {t("add")}
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="max-w-md space-y-1.5">
          <Label>{t("filters.class")}</Label>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.class")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("filters.allClasses")}</SelectItem>
              {(classesQuery.data ?? []).map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              <Button type="button" onClick={openCreate}>
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
                <TableHead className="hidden md:table-cell">
                  {t("columns.class")}
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("columns.subject")}
                </TableHead>
                <TableHead>{t("columns.examDate")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("columns.status")}
                </TableHead>
                <TableHead className="w-12 text-end">
                  <span className="sr-only">{tCommon("actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {item.class?.name ?? "—"}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {item.class?.name ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {item.subject?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(item.examDate, locale)}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {item.status}
                  </TableCell>
                  <TableCell className="text-end">
                    {canManage && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={tCommon("actions")}
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onSelect={() => openEdit(item)}>
                            {t("actions.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onSelect={() => setDeleting(item)}
                          >
                            {t("actions.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
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
            <SheetTitle>
              {editing ? t("editTitle") : t("createTitle")}
            </SheetTitle>
            <SheetDescription>
              {editing ? t("editSubtitle") : t("createSubtitle")}
            </SheetDescription>
          </SheetHeader>
          <form
            className="flex min-h-0 flex-1 flex-col px-4 pb-4"
            onSubmit={handleSubmit}
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
              {!editing && (
                <div className="space-y-1.5">
                  <Label>{t("fields.class")}</Label>
                  <Select value={classId || undefined} onValueChange={setClassId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("fields.classPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(classesQuery.data ?? []).map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-1.5">
                <Label>{t("fields.subject")}</Label>
                <Select
                  value={subjectId || undefined}
                  onValueChange={setSubjectId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.subjectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(subjectsQuery.data ?? []).map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="examTitle">{t("fields.title")}</Label>
                <Input
                  id="examTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="examDate">{t("fields.examDate")}</Label>
                  <Input
                    id="examDate"
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="durationMin">{t("fields.durationMin")}</Label>
                  <Input
                    id="durationMin"
                    type="number"
                    min={1}
                    value={durationMin}
                    onChange={(e) => setDurationMin(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("fields.status")}</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">
                      {t("status.SCHEDULED")}
                    </SelectItem>
                    <SelectItem value="COMPLETED">
                      {t("status.COMPLETED")}
                    </SelectItem>
                    <SelectItem value="CANCELLED">
                      {t("status.CANCELLED")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formError && (
                <p className="text-xs text-destructive">{formError}</p>
              )}
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSheetOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? tCommon("loading") : tCommon("save")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? t("deleteDescription", { name: deleting.title })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleting) deleteMutation.mutate(deleting.id);
              }}
            >
              {t("actions.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
