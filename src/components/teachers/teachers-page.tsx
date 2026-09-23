"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { TeacherFormSheet } from "@/components/teachers/teacher-form-sheet";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/types";
import type {
  CreateTeacherInput,
  Teacher,
  UpdateTeacherInput,
} from "@/lib/api/types";
import { campusesApi, teachersApi } from "@/lib/api/resources";
import { formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";

export const teachersQueryKey = ["teachers"] as const;

export function TeachersPage() {
  const t = useTranslations("teachers");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canCreate = isSuperAdmin || permissions.includes("teachers.create");
  const canUpdate = isSuperAdmin || permissions.includes("teachers.update");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);

  const campusesQuery = useQuery({
    queryKey: ["campuses"],
    queryFn: () => campusesApi.list(),
    staleTime: 60_000,
  });

  const listQuery = useQuery({
    queryKey: [...teachersQueryKey, "list", page, deferredSearch],
    queryFn: () =>
      teachersApi.list({
        page,
        pageSize: 20,
        q: deferredSearch || undefined,
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
    mutationFn: async (input: CreateTeacherInput | UpdateTeacherInput) => {
      if (editing) {
        return teachersApi.update(editing.id, input as UpdateTeacherInput);
      }
      return teachersApi.create(input as CreateTeacherInput);
    },
    onSuccess: async () => {
      toast.success(editing ? t("toasts.updated") : t("toasts.created"));
      setSheetOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: teachersQueryKey });
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

  function openEdit(teacher: Teacher) {
    setEditing(teacher);
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

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="relative max-w-md">
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
      </div>

      {listQuery.isLoading ? (
        <div className="space-y-2">
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
                    {t("columns.email")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("columns.campuses")}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t("columns.employeeCode")}
                  </TableHead>
                  <TableHead className="w-12 text-end">
                    <span className="sr-only">{tCommon("actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((teacher) => {
                  const campusLabels = teacher.campusIds
                    .map((id) => campusNameById.get(id))
                    .filter(Boolean)
                    .join(", ");
                  return (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <Link
                          href={`/teachers/${teacher.id}`}
                          className="font-medium text-foreground hover:text-primary"
                        >
                          {formatPersonName(
                            teacher.firstName,
                            teacher.lastName,
                          )}
                        </Link>
                        <p className="text-xs text-muted-foreground md:hidden">
                          {teacher.email}
                        </p>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {teacher.email}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground">
                        {campusLabels || "—"}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {teacher.employeeCode || "—"}
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
                              onSelect={() =>
                                router.push(`/teachers/${teacher.id}`)
                              }
                            >
                              {t("actions.view")}
                            </DropdownMenuItem>
                            {canUpdate && (
                              <DropdownMenuItem
                                onSelect={() => openEdit(teacher)}
                              >
                                {t("actions.edit")}
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

      <TeacherFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        campuses={campusesQuery.data ?? []}
        teacher={editing}
        submitting={saveMutation.isPending}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values);
        }}
      />
    </div>
  );
}
