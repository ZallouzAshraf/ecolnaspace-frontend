"use client";

import { ClassFormSheet } from "@/components/classes/class-form-sheet";
import { classesQueryKey } from "@/components/classes/classes-page";
import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/types";
import type { EnrollmentStatus, UpdateClassInput } from "@/lib/api/types";
import {
  academicYearsApi,
  campusesApi,
  classesApi,
  enrollmentsApi,
  studentsApi,
} from "@/lib/api/resources";
import { formatDate, formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

const ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  "ACTIVE",
  "COMPLETED",
  "WITHDRAWN",
  "TRANSFERRED",
];

type ClassDetailPageProps = {
  classId: string;
};

export function ClassDetailPage({ classId }: ClassDetailPageProps) {
  const t = useTranslations("classes");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();
  const canManage = isSuperAdmin || permissions.includes("classes.manage");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");

  const classQuery = useQuery({
    queryKey: [...classesQueryKey, "detail", classId],
    queryFn: () => classesApi.get(classId),
  });

  const campusesQuery = useQuery({
    queryKey: ["campuses"],
    queryFn: () => campusesApi.list(),
    staleTime: 60_000,
  });

  const yearsQuery = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => academicYearsApi.list(),
    staleTime: 60_000,
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments", "class", classId],
    queryFn: () => enrollmentsApi.listByClass(classId),
    retry: false,
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "enroll"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: canManage,
  });

  const saveMutation = useMutation({
    mutationFn: (input: UpdateClassInput) => classesApi.update(classId, input),
    onSuccess: async () => {
      toast.success(t("toasts.updated"));
      setSheetOpen(false);
      await queryClient.invalidateQueries({ queryKey: classesQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const enrollMutation = useMutation({
    mutationFn: (studentId: string) =>
      enrollmentsApi.create({ studentId, classId }),
    onSuccess: async () => {
      toast.success(t("toasts.enrolled"));
      setSelectedStudentId("");
      await queryClient.invalidateQueries({
        queryKey: ["enrollments", "class", classId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: EnrollmentStatus;
    }) => enrollmentsApi.updateStatus(id, status),
    onSuccess: async () => {
      toast.success(t("toasts.statusUpdated"));
      await queryClient.invalidateQueries({
        queryKey: ["enrollments", "class", classId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  if (classQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (classQuery.isError || !classQuery.data) {
    return (
      <ErrorState
        message={
          classQuery.error instanceof ApiError
            ? classQuery.error.message
            : t("notFound")
        }
        onRetry={() => void classQuery.refetch()}
      />
    );
  }

  const classRecord = classQuery.data;
  const enrollments = enrollmentsQuery.data?.data ?? [];
  const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;
  const enrolledStudentIds = new Set(enrollments.map((e) => e.studentId));
  const availableStudents = (studentsQuery.data?.data ?? []).filter(
    (s) => !enrolledStudentIds.has(s.id),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit">
            <Link href="/classes">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {tCommon("back")}
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {classRecord.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {classRecord.campus.name} · {classRecord.academicYear.name}
          </p>
        </div>
        {canManage && (
          <Button type="button" variant="outline" onClick={() => setSheetOpen(true)}>
            <Pencil className="size-4" />
            {t("actions.edit")}
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>{t("fields.gradeLevel")}</CardDescription>
            <CardTitle className="text-lg">
              {classRecord.gradeLevel || "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>{t("fields.capacity")}</CardDescription>
            <CardTitle className="text-lg">
              {classRecord.capacity ?? "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription>{t("enrolledActive")}</CardDescription>
            <CardTitle className="text-lg">{activeCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("enrollmentsTitle")}</CardTitle>
          <CardDescription>{t("enrollmentsSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {canManage && (
            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label>{t("fields.student")}</Label>
                <Select
                  value={selectedStudentId || undefined}
                  onValueChange={setSelectedStudentId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.studentPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {formatPersonName(student.firstName, student.lastName)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                disabled={!selectedStudentId || enrollMutation.isPending}
                onClick={() => enrollMutation.mutate(selectedStudentId)}
              >
                <Plus className="size-4" />
                {t("actions.enroll")}
              </Button>
            </div>
          )}

          {enrollmentsQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : enrollmentsQuery.isError ? (
            <EmptyState
              title={t("enrollmentsUnavailableTitle")}
              description={t("enrollmentsUnavailableDescription")}
            />
          ) : enrollments.length === 0 ? (
            <EmptyState
              title={t("enrollmentsEmptyTitle")}
              description={t("enrollmentsEmptyDescription")}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("columns.student")}</TableHead>
                    <TableHead>{t("columns.status")}</TableHead>
                    <TableHead>{t("columns.enrolledOn")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((enrollment) => (
                    <TableRow key={enrollment.id}>
                      <TableCell>
                        <Link
                          href={`/students/${enrollment.studentId}`}
                          className="font-medium hover:text-primary"
                        >
                          {formatPersonName(
                            enrollment.student.firstName,
                            enrollment.student.lastName,
                          )}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {canManage ? (
                          <Select
                            value={enrollment.status}
                            onValueChange={(value) =>
                              statusMutation.mutate({
                                id: enrollment.id,
                                status: value as EnrollmentStatus,
                              })
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {ENROLLMENT_STATUSES.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {t(`enrollmentStatus.${status}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className="text-muted-foreground">
                            {t(`enrollmentStatus.${enrollment.status}`)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(enrollment.enrolledOn, locale)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <ClassFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        campuses={campusesQuery.data ?? []}
        academicYears={yearsQuery.data ?? []}
        classRecord={classRecord}
        submitting={saveMutation.isPending}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values as UpdateClassInput);
        }}
      />
    </div>
  );
}
