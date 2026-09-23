"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { StudentFormSheet } from "@/components/students/student-form-sheet";
import { StudentStatusBadge } from "@/components/students/student-status-badge";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/types";
import {
  STUDENT_STATUSES,
  type Student,
  type StudentInput,
  type StudentStatus,
} from "@/lib/api/types";
import { campusesApi, studentsApi } from "@/lib/api/resources";
import { calculateAge, formatDate, formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";

export const studentsQueryKey = ["students"] as const;

export function StudentsPage() {
  const t = useTranslations("students");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canCreate = isSuperAdmin || permissions.includes("students.create");
  const canUpdate = isSuperAdmin || permissions.includes("students.update");
  const canDelete = isSuperAdmin || permissions.includes("students.delete");
  const canEditMedical =
    isSuperAdmin || permissions.includes("students.medical.read");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] = useState<string>("__all__");
  const [campusId, setCampusId] = useState<string>("__all__");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const campusesQuery = useQuery({
    queryKey: ["campuses"],
    queryFn: () => campusesApi.list(),
    staleTime: 60_000,
  });

  const listQuery = useQuery({
    queryKey: [
      ...studentsQueryKey,
      "list",
      page,
      deferredSearch,
      status,
      campusId,
    ],
    queryFn: () =>
      studentsApi.list({
        page,
        pageSize: 20,
        q: deferredSearch || undefined,
        status:
          status === "__all__" ? undefined : (status as StudentStatus),
        campusId: campusId === "__all__" ? undefined : campusId,
      }),
  });

  const campusNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const campus of campusesQuery.data ?? []) {
      map.set(campus.id, campus.name);
    }
    return map;
  }, [campusesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (input: StudentInput) => {
      if (editing) {
        return studentsApi.update(editing.id, input);
      }
      return studentsApi.create(input);
    },
    onSuccess: async () => {
      toast.success(editing ? t("toasts.updated") : t("toasts.created"));
      setSheetOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: studentsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => studentsApi.remove(id),
    onSuccess: async () => {
      toast.success(t("toasts.deleted"));
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: studentsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function openCreate() {
    setEditing(null);
    setSheetOpen(true);
  }

  function openEdit(student: Student) {
    setEditing(student);
    setSheetOpen(true);
  }

  const rows = listQuery.data?.data ?? [];
  const meta = listQuery.data?.meta;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {canCreate && (
          <Button type="button" onClick={openCreate}>
            <Plus className="size-4" />
            {t("add")}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={t("searchPlaceholder")}
            className="ps-8"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder={t("filters.status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("filters.allStatuses")}</SelectItem>
            {STUDENT_STATUSES.map((item) => (
              <SelectItem key={item} value={item}>
                {t(`status.${item}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={campusId}
          onValueChange={(value) => {
            setCampusId(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t("filters.campus")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("filters.allCampuses")}</SelectItem>
            {(campusesQuery.data ?? []).map((campus) => (
              <SelectItem key={campus.id} value={campus.id}>
                {campus.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {listQuery.isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
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
            canCreate ? (
              <Button type="button" onClick={openCreate}>
                <Plus className="size-4" />
                {t("add")}
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("columns.birth")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("columns.campus")}
                  </TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead className="w-12 text-end">
                    <span className="sr-only">{tCommon("actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((student) => {
                  const age = calculateAge(student.dateOfBirth);
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Link
                          href={`/students/${student.id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {formatPersonName(
                            student.firstName,
                            student.lastName,
                            student.preferredName,
                          )}
                        </Link>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {formatDate(student.dateOfBirth, locale)}
                          {age !== null ? ` · ${age}` : ""}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDate(student.dateOfBirth, locale)}
                        {age !== null ? (
                          <span className="ms-1 text-xs">
                            ({t("ageYears", { count: age })})
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {student.campusId
                          ? (campusNameById.get(student.campusId) ?? "—")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <StudentStatusBadge status={student.status} />
                      </TableCell>
                      <TableCell className="text-end">
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
                            <DropdownMenuItem
                              onSelect={() => router.push(`/students/${student.id}`)}
                            >
                              {t("actions.view")}
                            </DropdownMenuItem>
                            {canUpdate && (
                              <DropdownMenuItem
                                onSelect={() => openEdit(student)}
                              >
                                {t("actions.edit")}
                              </DropdownMenuItem>
                            )}
                            {canDelete && (
                              <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setDeleting(student)}
                              >
                                {t("actions.delete")}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {t("pagination", {
                  page: meta.page,
                  totalPages: meta.totalPages,
                  total: meta.total,
                })}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {tCommon("previous")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {tCommon("next")}
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <StudentFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        campuses={campusesQuery.data ?? []}
        student={editing}
        submitting={saveMutation.isPending}
        canEditMedical={canEditMedical}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values);
        }}
      />

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
                    name: formatPersonName(
                      deleting.firstName,
                      deleting.lastName,
                      deleting.preferredName,
                    ),
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
