"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
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
import type {
  AttendanceInput,
  AttendanceRecord,
  AttendanceStatus,
} from "@/lib/api/types";
import {
  attendanceApi,
  classesApi,
  studentsApi,
} from "@/lib/api/resources";
import { formatPersonName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

export const attendanceQueryKey = ["attendance"] as const;

const STATUSES: AttendanceStatus[] = [
  "PRESENT",
  "ABSENT",
  "LATE",
  "EXCUSED",
];

function todayDateString() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function statusBadgeClass(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return "border-transparent bg-success/15 text-success";
    case "ABSENT":
      return "border-transparent bg-destructive/15 text-destructive";
    case "LATE":
      return "border-transparent bg-warning/15 text-warning";
    case "EXCUSED":
      return "border-transparent bg-muted text-muted-foreground";
    default:
      return "";
  }
}

type FormState = {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  classId: string;
  notes: string;
};

const emptyForm = (date: string): FormState => ({
  studentId: "",
  date,
  status: "PRESENT",
  classId: "",
  notes: "",
});

export function AttendancePage() {
  const t = useTranslations("attendance");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canCreate = isSuperAdmin || permissions.includes("attendance.create");
  const canUpdate = isSuperAdmin || permissions.includes("attendance.update");
  const canWrite = canCreate || canUpdate;

  const [date, setDate] = useState(todayDateString);
  const [classFilter, setClassFilter] = useState("__all__");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [form, setForm] = useState<FormState>(() => emptyForm(todayDateString()));

  const listQuery = useQuery({
    queryKey: [
      ...attendanceQueryKey,
      date,
      classFilter === "__all__" ? null : classFilter,
    ],
    queryFn: () =>
      attendanceApi.list({
        date,
        classId: classFilter === "__all__" ? undefined : classFilter,
      }),
  });

  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesApi.list(),
    staleTime: 60_000,
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "options"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: sheetOpen,
  });

  const studentOptions = useMemo(
    () => studentsQuery.data?.data ?? [],
    [studentsQuery.data],
  );

  const saveMutation = useMutation({
    mutationFn: async (input: AttendanceInput) => {
      if (editing) {
        return attendanceApi.update(editing.id, input);
      }
      return attendanceApi.upsert(input);
    },
    onSuccess: async () => {
      toast.success(editing ? t("toasts.updated") : t("toasts.recorded"));
      setSheetOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: attendanceQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function openCreate() {
    setEditing(null);
    setForm({
      ...emptyForm(date),
      classId: classFilter !== "__all__" ? classFilter : "",
    });
    setSheetOpen(true);
  }

  function openEdit(record: AttendanceRecord) {
    setEditing(record);
    setForm({
      studentId: record.studentId,
      date: record.date.slice(0, 10),
      status: record.status,
      classId: record.classId ?? "",
      notes: record.notes ?? "",
    });
    setSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.studentId || !form.date) {
      toast.error(t("errors.required"));
      return;
    }
    void saveMutation.mutateAsync({
      studentId: form.studentId,
      date: form.date,
      status: form.status,
      classId: form.classId || undefined,
      notes: form.notes.trim() || undefined,
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
        {canWrite && (
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            {t("add")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="space-y-1.5 sm:w-44">
          <Label htmlFor="attendance-date">{t("filters.date")}</Label>
          <Input
            id="attendance-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="space-y-1.5 sm:w-56">
          <Label>{t("filters.class")}</Label>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t("filters.class")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">{t("filters.allClasses")}</SelectItem>
              {(classesQuery.data ?? []).map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.name}
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
            canWrite ? (
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
                  {t("columns.class")}
                </TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("columns.notes")}
                </TableHead>
                <TableHead className="w-12 text-end">
                  <span className="sr-only">{tCommon("actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <p className="font-medium">
                      {record.student
                        ? formatPersonName(
                            record.student.firstName,
                            record.student.lastName,
                          )
                        : record.studentId}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {record.class?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full",
                        statusBadgeClass(record.status),
                      )}
                    >
                      {t(`status.${record.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {record.notes || "—"}
                  </TableCell>
                  <TableCell className="text-end">
                    {canUpdate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(record)}
                      >
                        {t("actions.edit")}
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
            <SheetTitle>
              {editing ? t("editTitle") : t("createTitle")}
            </SheetTitle>
            <SheetDescription>
              {editing ? t("editSubtitle") : t("createSubtitle")}
            </SheetDescription>
          </SheetHeader>
          <form
            className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4"
            onSubmit={handleSubmit}
          >
            <div className="flex-1 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <Label>{t("fields.student")}</Label>
                <Select
                  value={form.studentId || undefined}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, studentId: v }))
                  }
                  disabled={Boolean(editing)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.studentPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {studentOptions.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {formatPersonName(student.firstName, student.lastName)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="att-date">{t("fields.date")}</Label>
                <Input
                  id="att-date"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("fields.status")}</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      status: v as AttendanceStatus,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {t(`status.${status}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t("fields.class")}</Label>
                <Select
                  value={form.classId || "__none__"}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      classId: v === "__none__" ? "" : v,
                    }))
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.classPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      {t("fields.noClass")}
                    </SelectItem>
                    {(classesQuery.data ?? []).map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="att-notes">{t("fields.notes")}</Label>
                <Textarea
                  id="att-notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
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
              <Button type="submit" disabled={saveMutation.isPending}>
                {tCommon("save")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
