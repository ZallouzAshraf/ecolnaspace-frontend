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
  classesApi,
  schedulesApi,
  subjectsApi,
  teachersApi,
} from "@/lib/api/resources";
import { ApiError } from "@/lib/api/types";
import type { CreateScheduleInput, ScheduleSlot } from "@/lib/api/types";
import { formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

const NONE = "__none__";

export function SchedulesPage() {
  const t = useTranslations("schedules");
  const tCommon = useTranslations("common");
  const rtl = isRtlLocale(useLocale());
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canManage = isSuperAdmin || permissions.includes("classes.manage");

  const [classId, setClassId] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleting, setDeleting] = useState<ScheduleSlot | null>(null);

  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("09:00");
  const [subjectId, setSubjectId] = useState(NONE);
  const [teacherProfileId, setTeacherProfileId] = useState(NONE);
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
    enabled: sheetOpen,
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers", "schedules"],
    queryFn: () => teachersApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: sheetOpen,
  });

  const slotsQuery = useQuery({
    queryKey: ["schedules", classId],
    queryFn: () => schedulesApi.listByClass(classId),
    enabled: Boolean(classId),
  });

  const sortedSlots = useMemo(() => {
    return [...(slotsQuery.data ?? [])].sort((a, b) => {
      if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [slotsQuery.data]);

  const createMutation = useMutation({
    mutationFn: (input: CreateScheduleInput) => schedulesApi.create(input),
    onSuccess: async () => {
      toast.success(t("toasts.created"));
      setSheetOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["schedules", classId] });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => schedulesApi.remove(id),
    onSuccess: async () => {
      toast.success(t("toasts.deleted"));
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: ["schedules", classId] });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function openCreate() {
    setDayOfWeek("1");
    setStartTime("08:00");
    setEndTime("09:00");
    setSubjectId(NONE);
    setTeacherProfileId(NONE);
    setFormError(null);
    setSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!classId) {
      setFormError(t("errors.class"));
      return;
    }
    if (!startTime || !endTime) {
      setFormError(t("errors.times"));
      return;
    }
    setFormError(null);
    void createMutation.mutateAsync({
      classId,
      dayOfWeek: Number(dayOfWeek),
      startTime,
      endTime,
      subjectId: subjectId === NONE ? undefined : subjectId,
      teacherProfileId:
        teacherProfileId === NONE ? undefined : teacherProfileId,
    });
  }

  function dayLabel(day: number) {
    return t(`days.${day}` as "days.1");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {canManage && classId && (
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            {t("add")}
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="max-w-md space-y-1.5">
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
      </div>

      {!classId ? (
        <EmptyState
          title={t("emptySelectTitle")}
          description={t("emptySelectDescription")}
        />
      ) : slotsQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : slotsQuery.isError ? (
        <ErrorState
          message={
            slotsQuery.error instanceof ApiError
              ? slotsQuery.error.message
              : undefined
          }
          onRetry={() => void slotsQuery.refetch()}
        />
      ) : sortedSlots.length === 0 ? (
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
                <TableHead>{t("columns.day")}</TableHead>
                <TableHead>{t("columns.startTime")}</TableHead>
                <TableHead>{t("columns.endTime")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("columns.subject")}
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("columns.teacher")}
                </TableHead>
                <TableHead className="w-12 text-end">
                  <span className="sr-only">{tCommon("actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSlots.map((slot) => (
                <TableRow key={slot.id}>
                  <TableCell className="font-medium">
                    {dayLabel(slot.dayOfWeek)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {slot.startTime.slice(0, 5)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {slot.endTime.slice(0, 5)}
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {slot.subject?.name ?? "—"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {slot.teacher
                      ? formatPersonName(
                          slot.teacher.firstName,
                          slot.teacher.lastName,
                        )
                      : "—"}
                  </TableCell>
                  <TableCell className="text-end">
                    {canManage && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={t("actions.delete")}
                        onClick={() => setDeleting(slot)}
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
                <Label>{t("fields.dayOfWeek")}</Label>
                <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <SelectItem key={day} value={String(day)}>
                        {dayLabel(day)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startTime">{t("fields.startTime")}</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endTime">{t("fields.endTime")}</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("fields.subject")}</Label>
                <Select value={subjectId} onValueChange={setSubjectId}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.subjectOptional")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>
                      {t("fields.subjectOptional")}
                    </SelectItem>
                    {(subjectsQuery.data ?? []).map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("fields.teacher")}</Label>
                <Select
                  value={teacherProfileId}
                  onValueChange={setTeacherProfileId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.teacherOptional")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>
                      {t("fields.teacherOptional")}
                    </SelectItem>
                    {(teachersQuery.data?.data ?? []).map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {formatPersonName(teacher.firstName, teacher.lastName)}
                      </SelectItem>
                    ))}
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
                ? t("deleteDescription", {
                    day: dayLabel(deleting.dayOfWeek),
                    time: `${deleting.startTime.slice(0, 5)}–${deleting.endTime.slice(0, 5)}`,
                  })
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
