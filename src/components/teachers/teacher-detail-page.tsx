"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { TeacherFormSheet } from "@/components/teachers/teacher-form-sheet";
import { teachersQueryKey } from "@/components/teachers/teachers-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/types";
import type { UpdateTeacherInput } from "@/lib/api/types";
import { campusesApi, teachersApi } from "@/lib/api/resources";
import { formatDate, formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type TeacherDetailPageProps = {
  teacherId: string;
};

export function TeacherDetailPage({ teacherId }: TeacherDetailPageProps) {
  const t = useTranslations("teachers");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();
  const canUpdate = isSuperAdmin || permissions.includes("teachers.update");
  const [sheetOpen, setSheetOpen] = useState(false);

  const teacherQuery = useQuery({
    queryKey: [...teachersQueryKey, "detail", teacherId],
    queryFn: () => teachersApi.get(teacherId),
  });

  const campusesQuery = useQuery({
    queryKey: ["campuses"],
    queryFn: () => campusesApi.list(),
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: (input: UpdateTeacherInput) =>
      teachersApi.update(teacherId, input),
    onSuccess: async () => {
      toast.success(t("toasts.updated"));
      setSheetOpen(false);
      await queryClient.invalidateQueries({ queryKey: teachersQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  if (teacherQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (teacherQuery.isError || !teacherQuery.data) {
    return (
      <ErrorState
        message={
          teacherQuery.error instanceof ApiError
            ? teacherQuery.error.message
            : t("notFound")
        }
        onRetry={() => void teacherQuery.refetch()}
      />
    );
  }

  const teacher = teacherQuery.data;
  const campusLabels = teacher.campusIds
    .map((id) => campusesQuery.data?.find((c) => c.id === id)?.name)
    .filter(Boolean);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit">
            <Link href="/teachers">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {tCommon("back")}
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">
            {formatPersonName(teacher.firstName, teacher.lastName)}
          </h1>
          <p className="text-sm text-muted-foreground">{teacher.email}</p>
        </div>
        {canUpdate && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setSheetOpen(true)}
          >
            <Pencil className="size-4" />
            {t("actions.edit")}
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("form.identity")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label={t("fields.email")} value={teacher.email} />
            <InfoRow label={t("fields.phone")} value={teacher.phone} />
            <InfoRow
              label={t("fields.employeeCode")}
              value={teacher.employeeCode}
            />
            <InfoRow
              label={t("fields.createdAt")}
              value={formatDate(teacher.createdAt, locale)}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("form.campuses")}</CardTitle>
          </CardHeader>
          <CardContent>
            {campusLabels.length === 0 ? (
              <EmptyState
                title={t("noCampusesAssigned")}
                description={t("noCampusesAssignedDescription")}
              />
            ) : (
              <ul className="space-y-1 text-sm">
                {campusLabels.map((name) => (
                  <li key={name} className="font-medium">
                    {name}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">{t("fields.bio")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {teacher.bio?.trim() ? teacher.bio : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <TeacherFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        campuses={campusesQuery.data ?? []}
        teacher={teacher}
        submitting={saveMutation.isPending}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values as UpdateTeacherInput);
        }}
      />
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground sm:text-end">
        {value?.trim() ? value : "—"}
      </span>
    </div>
  );
}
