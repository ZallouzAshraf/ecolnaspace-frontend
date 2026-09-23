"use client";

import { ClassFormSheet } from "@/components/classes/class-form-sheet";
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
import { Link, useRouter } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/types";
import type {
  ClassRecord,
  CreateClassInput,
  UpdateClassInput,
} from "@/lib/api/types";
import {
  academicYearsApi,
  campusesApi,
  classesApi,
} from "@/lib/api/resources";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";

export const classesQueryKey = ["classes"] as const;

export function ClassesPage() {
  const t = useTranslations("classes");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canManage = isSuperAdmin || permissions.includes("classes.manage");

  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [campusFilter, setCampusFilter] = useState("__all__");
  const [yearFilter, setYearFilter] = useState("__all__");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ClassRecord | null>(null);
  const [deleting, setDeleting] = useState<ClassRecord | null>(null);

  const listQuery = useQuery({
    queryKey: classesQueryKey,
    queryFn: () => classesApi.list(),
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

  const filtered = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    return (listQuery.data ?? []).filter((item) => {
      if (campusFilter !== "__all__" && item.campusId !== campusFilter) {
        return false;
      }
      if (yearFilter !== "__all__" && item.academicYearId !== yearFilter) {
        return false;
      }
      if (!q) return true;
      return [item.name, item.gradeLevel, item.campus.name, item.academicYear.name]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q));
    });
  }, [listQuery.data, deferredSearch, campusFilter, yearFilter]);

  const saveMutation = useMutation({
    mutationFn: async (input: CreateClassInput | UpdateClassInput) => {
      if (editing) return classesApi.update(editing.id, input as UpdateClassInput);
      return classesApi.create(input as CreateClassInput);
    },
    onSuccess: async () => {
      toast.success(editing ? t("toasts.updated") : t("toasts.created"));
      setSheetOpen(false);
      setEditing(null);
      await queryClient.invalidateQueries({ queryKey: classesQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => classesApi.remove(id),
    onSuccess: async () => {
      toast.success(t("toasts.deleted"));
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: classesQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

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
          <Button
            type="button"
            onClick={() => {
              setEditing(null);
              setSheetOpen(true);
            }}
          >
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="ps-8"
            aria-label={t("searchPlaceholder")}
          />
        </div>
        <Select value={campusFilter} onValueChange={setCampusFilter}>
          <SelectTrigger className="w-full sm:w-44">
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
        <Select value={yearFilter} onValueChange={setYearFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder={t("filters.year")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">{t("filters.allYears")}</SelectItem>
            {(yearsQuery.data ?? []).map((year) => (
              <SelectItem key={year.id} value={year.id}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            canManage ? (
              <Button
                type="button"
                onClick={() => {
                  setEditing(null);
                  setSheetOpen(true);
                }}
              >
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
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("columns.campus")}
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("columns.year")}
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("columns.gradeLevel")}
                </TableHead>
                <TableHead className="hidden sm:table-cell">
                  {t("columns.capacity")}
                </TableHead>
                <TableHead className="w-12 text-end">
                  <span className="sr-only">{tCommon("actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Link
                      href={`/classes/${item.id}`}
                      className="font-medium text-foreground hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-muted-foreground md:hidden">
                      {item.campus.name}
                    </p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {item.campus.name}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {item.academicYear.name}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {item.gradeLevel || "—"}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell text-muted-foreground">
                    {item.capacity ?? "—"}
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
                          onSelect={() => router.push(`/classes/${item.id}`)}
                        >
                          {t("actions.view")}
                        </DropdownMenuItem>
                        {canManage && (
                          <>
                            <DropdownMenuItem
                              onSelect={() => {
                                setEditing(item);
                                setSheetOpen(true);
                              }}
                            >
                              {t("actions.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setDeleting(item)}
                            >
                              {t("actions.delete")}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ClassFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        campuses={campusesQuery.data ?? []}
        academicYears={yearsQuery.data ?? []}
        classRecord={editing}
        submitting={saveMutation.isPending}
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
                ? t("deleteDescription", { name: deleting.name })
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
