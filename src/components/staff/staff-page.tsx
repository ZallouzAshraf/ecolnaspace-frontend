"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { isRtlLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/types";
import type {
  CreateStaffInput,
  StaffMember,
  UpdateStaffInput,
} from "@/lib/api/types";
import { staffApi } from "@/lib/api/resources";
import { emptyToUndefined, formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Plus, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

export const staffQueryKey = ["staff"] as const;

type FormState = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  department: string;
};

const emptyForm = (): FormState => ({
  email: "",
  firstName: "",
  lastName: "",
  phone: "",
  jobTitle: "",
  department: "",
});

export function StaffPage() {
  const t = useTranslations("staff");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canCreate = isSuperAdmin || permissions.includes("staff.create");
  const canUpdate = isSuperAdmin || permissions.includes("staff.update");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const listQuery = useQuery({
    queryKey: [...staffQueryKey, "list", page, deferredSearch],
    queryFn: () =>
      staffApi.list({
        page,
        pageSize: 20,
        q: deferredSearch || undefined,
      }),
  });

  const saveMutation = useMutation({
    mutationFn: async (input: CreateStaffInput | UpdateStaffInput) => {
      if (editing) {
        return staffApi.update(editing.id, input as UpdateStaffInput);
      }
      return staffApi.create(input as CreateStaffInput);
    },
    onSuccess: async () => {
      toast.success(editing ? t("toasts.updated") : t("toasts.created"));
      setSheetOpen(false);
      setEditing(null);
      setForm(emptyForm());
      await queryClient.invalidateQueries({ queryKey: staffQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setSheetOpen(true);
  }

  function openEdit(member: StaffMember) {
    setEditing(member);
    setForm({
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      phone: member.phone ?? "",
      jobTitle: member.jobTitle ?? "",
      department: member.department ?? "",
    });
    setSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      toast.error(t("errors.required"));
      return;
    }
    if (!editing && !form.email.trim()) {
      toast.error(t("errors.email"));
      return;
    }

    if (editing) {
      void saveMutation.mutateAsync({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: emptyToUndefined(form.phone),
        jobTitle: emptyToUndefined(form.jobTitle),
        department: emptyToUndefined(form.department),
      });
      return;
    }

    void saveMutation.mutateAsync({
      email: form.email.trim().toLowerCase(),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: emptyToUndefined(form.phone),
      jobTitle: emptyToUndefined(form.jobTitle),
      department: emptyToUndefined(form.department),
    });
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
                    {t("columns.jobTitle")}
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    {t("columns.department")}
                  </TableHead>
                  <TableHead className="w-12 text-end">
                    <span className="sr-only">{tCommon("actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <p className="font-medium">
                        {formatPersonName(member.firstName, member.lastName)}
                      </p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {member.email}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {member.jobTitle || "—"}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {member.department || "—"}
                    </TableCell>
                    <TableCell className="text-end">
                      {canUpdate && (
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
                              onSelect={() => openEdit(member)}
                            >
                              {t("actions.edit")}
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
              {!editing && (
                <div className="space-y-1.5">
                  <Label htmlFor="staff-email">{t("fields.email")}</Label>
                  <Input
                    id="staff-email"
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    required
                  />
                </div>
              )}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="staff-first">{t("fields.firstName")}</Label>
                  <Input
                    id="staff-first"
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, firstName: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="staff-last">{t("fields.lastName")}</Label>
                  <Input
                    id="staff-last"
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, lastName: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="staff-phone">{t("fields.phone")}</Label>
                <Input
                  id="staff-phone"
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="staff-job">{t("fields.jobTitle")}</Label>
                <Input
                  id="staff-job"
                  value={form.jobTitle}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, jobTitle: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="staff-dept">{t("fields.department")}</Label>
                <Input
                  id="staff-dept"
                  value={form.department}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, department: e.target.value }))
                  }
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
