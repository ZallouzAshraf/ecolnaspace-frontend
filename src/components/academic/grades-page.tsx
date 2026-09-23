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
import {
  examsApi,
  gradesApi,
  studentsApi,
  subjectsApi,
} from "@/lib/api/resources";
import { ApiError } from "@/lib/api/types";
import type { Grade, GradeInput } from "@/lib/api/types";
import { formatDate, formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

const ALL = "__all__";
const NONE = "__none__";

export function GradesPage() {
  const t = useTranslations("grades");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canManage = isSuperAdmin || permissions.includes("grades.manage");

  const [subjectFilter, setSubjectFilter] = useState(ALL);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<Grade | null>(null);

  const [studentId, setStudentId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examId, setExamId] = useState(NONE);
  const [assessment, setAssessment] = useState("");
  const [score, setScore] = useState("");
  const [maxScore, setMaxScore] = useState("20");
  const [gradedOn, setGradedOn] = useState(
    () => new Date().toISOString().slice(0, 10),
  );
  const [formError, setFormError] = useState<string | null>(null);

  const subjectsQuery = useQuery({
    queryKey: ["subjects"],
    queryFn: () => subjectsApi.list(),
    staleTime: 60_000,
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "grades"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: sheetOpen,
  });

  const examsQuery = useQuery({
    queryKey: ["exams", "grades"],
    queryFn: () => examsApi.list({ pageSize: 100 }),
    staleTime: 60_000,
    enabled: sheetOpen,
  });

  const listQuery = useQuery({
    queryKey: ["grades", subjectFilter],
    queryFn: () =>
      gradesApi.list({
        subjectId: subjectFilter === ALL ? undefined : subjectFilter,
        pageSize: 50,
      }),
  });

  function openCreate() {
    setStudentId("");
    setSubjectId(
      subjectFilter !== ALL
        ? subjectFilter
        : subjectsQuery.data?.[0]?.id ?? "",
    );
    setExamId(NONE);
    setAssessment("");
    setScore("");
    setMaxScore("20");
    setGradedOn(new Date().toISOString().slice(0, 10));
    setFormError(null);
    setSheetOpen(true);
  }

  const createMutation = useMutation({
    mutationFn: (input: GradeInput) => gradesApi.create(input),
    onSuccess: async () => {
      toast.success(t("toasts.created"));
      setSheetOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gradesApi.remove(id),
    onSuccess: async () => {
      toast.success(t("toasts.deleted"));
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) {
      setFormError(t("errors.student"));
      return;
    }
    if (!subjectId) {
      setFormError(t("errors.subject"));
      return;
    }
    if (!assessment.trim()) {
      setFormError(t("errors.assessment"));
      return;
    }
    if (!score.trim() || !maxScore.trim()) {
      setFormError(t("errors.score"));
      return;
    }
    if (!gradedOn) {
      setFormError(t("errors.gradedOn"));
      return;
    }
    setFormError(null);
    void createMutation.mutateAsync({
      studentId,
      subjectId,
      examId: examId === NONE ? undefined : examId,
      assessment: assessment.trim(),
      score: score.trim(),
      maxScore: maxScore.trim(),
      gradedOn,
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
          <Label>{t("filters.subject")}</Label>
          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.subject")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("filters.allSubjects")}</SelectItem>
              {(subjectsQuery.data ?? []).map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
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
                <TableHead>{t("columns.student")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("columns.subject")}
                </TableHead>
                <TableHead>{t("columns.assessment")}</TableHead>
                <TableHead>{t("columns.score")}</TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("columns.gradedOn")}
                </TableHead>
                <TableHead className="w-12 text-end">
                  <span className="sr-only">{tCommon("actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.student
                      ? formatPersonName(
                          item.student.firstName,
                          item.student.lastName,
                        )
                      : "—"}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {item.subject?.name ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.assessment}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.score}/{item.maxScore}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {formatDate(item.gradedOn, locale)}
                  </TableCell>
                  <TableCell className="text-end">
                    {canManage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("actions.delete")}
                        onClick={() => setDeleting(item)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
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
            <SheetTitle>{t("createTitle")}</SheetTitle>
            <SheetDescription>{t("createSubtitle")}</SheetDescription>
          </SheetHeader>
          <form
            className="flex min-h-0 flex-1 flex-col px-4 pb-4"
            onSubmit={handleSubmit}
          >
            <div className="flex-1 space-y-4 overflow-y-auto px-2 pb-4">
              <div className="space-y-1.5">
                <Label>{t("fields.student")}</Label>
                <Select
                  value={studentId || undefined}
                  onValueChange={setStudentId}
                >
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
                <Label>{t("fields.exam")}</Label>
                <Select value={examId} onValueChange={setExamId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.examOptional")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>
                      {t("fields.examOptional")}
                    </SelectItem>
                    {(examsQuery.data?.data ?? []).map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="assessment">{t("fields.assessment")}</Label>
                <Input
                  id="assessment"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder={t("fields.assessmentPlaceholder")}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="score">{t("fields.score")}</Label>
                  <Input
                    id="score"
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="maxScore">{t("fields.maxScore")}</Label>
                  <Input
                    id="maxScore"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="gradedOn">{t("fields.gradedOn")}</Label>
                <Input
                  id="gradedOn"
                  type="date"
                  value={gradedOn}
                  onChange={(e) => setGradedOn(e.target.value)}
                />
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
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending
                  ? tCommon("loading")
                  : tCommon("save")}
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
                ? t("deleteDescription", { name: deleting.assessment })
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
