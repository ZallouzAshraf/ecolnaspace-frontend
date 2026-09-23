"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiError } from "@/lib/api/types";
import type { Membership, MembershipRole } from "@/lib/api/types";
import { MEMBERSHIP_ROLES } from "@/lib/api/types";
import { campusesApi, membershipsApi } from "@/lib/api/resources";
import { formatPersonName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MoreHorizontal, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useDeferredValue, useState } from "react";
import { toast } from "sonner";

export const membershipsQueryKey = ["memberships"] as const;

const ALL = "__all__";
const NO_CAMPUS = "__none__";

export function MembershipsPage() {
  const t = useTranslations("memberships");
  const tCommon = useTranslations("common");
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canManage =
    isSuperAdmin || permissions.includes("memberships.manage");

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [roleFilter, setRoleFilter] = useState(ALL);
  const [removing, setRemoving] = useState<Membership | null>(null);

  const campusesQuery = useQuery({
    queryKey: ["campuses"],
    queryFn: () => campusesApi.list(),
    staleTime: 60_000,
  });

  const listQuery = useQuery({
    queryKey: [
      ...membershipsQueryKey,
      "list",
      page,
      deferredSearch,
      statusFilter,
      roleFilter,
    ],
    queryFn: () =>
      membershipsApi.list({
        page,
        pageSize: 20,
        q: deferredSearch || undefined,
        status: statusFilter === ALL ? undefined : statusFilter,
        role: roleFilter === ALL ? undefined : roleFilter,
      }),
    enabled: canManage,
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof membershipsApi.update>[1];
    }) => membershipsApi.update(id, input),
    onSuccess: async () => {
      toast.success(t("toasts.updated"));
      setRemoving(null);
      await queryClient.invalidateQueries({ queryKey: membershipsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const meta = listQuery.data?.meta;
  const rows = listQuery.data?.data ?? [];

  if (!canManage) {
    return (
      <EmptyState
        title={t("forbiddenTitle")}
        description={t("forbiddenDescription")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="relative max-w-md flex-1">
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
          <div className="grid gap-3 sm:grid-cols-2 lg:w-[28rem]">
            <div className="space-y-1.5">
              <Label>{t("filters.status")}</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => {
                  setStatusFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("filters.allStatuses")}</SelectItem>
                  <SelectItem value="ACTIVE">{t("status.ACTIVE")}</SelectItem>
                  <SelectItem value="INVITED">{t("status.INVITED")}</SelectItem>
                  <SelectItem value="SUSPENDED">
                    {t("status.SUSPENDED")}
                  </SelectItem>
                  <SelectItem value="REMOVED">{t("status.REMOVED")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("filters.role")}</Label>
              <Select
                value={roleFilter}
                onValueChange={(value) => {
                  setRoleFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>{t("filters.allRoles")}</SelectItem>
                  {MEMBERSHIP_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`roles.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
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
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.user")}</TableHead>
                  <TableHead>{t("columns.role")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("columns.campus")}
                  </TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead className="w-12 text-end">
                    <span className="sr-only">{tCommon("actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((membership) => (
                  <TableRow key={membership.id}>
                    <TableCell>
                      <p className="font-medium">
                        {formatPersonName(
                          membership.user.firstName,
                          membership.user.lastName,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {membership.user.email}
                      </p>
                    </TableCell>
                    <TableCell>
                      {MEMBERSHIP_ROLES.includes(
                        membership.role as (typeof MEMBERSHIP_ROLES)[number],
                      ) ? (
                        <Select
                          value={membership.role}
                          disabled={updateMutation.isPending}
                          onValueChange={(role) =>
                            updateMutation.mutate({
                              id: membership.id,
                              input: { role: role as MembershipRole },
                            })
                          }
                        >
                          <SelectTrigger className="h-8 w-[11.5rem]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MEMBERSHIP_ROLES.map((role) => (
                              <SelectItem key={role} value={role}>
                                {t(`roles.${role}`)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm">{membership.role}</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Select
                        value={membership.campusId ?? NO_CAMPUS}
                        disabled={updateMutation.isPending}
                        onValueChange={(value) =>
                          updateMutation.mutate({
                            id: membership.id,
                            input: {
                              campusId: value === NO_CAMPUS ? null : value,
                            },
                          })
                        }
                      >
                        <SelectTrigger className="h-8 w-[11rem]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={NO_CAMPUS}>
                            {t("campusNone")}
                          </SelectItem>
                          {(campusesQuery.data ?? []).map((campus) => (
                            <SelectItem key={campus.id} value={campus.id}>
                              {campus.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border-transparent",
                          membership.status === "ACTIVE" &&
                            "bg-success/15 text-success",
                          membership.status === "INVITED" &&
                            "bg-info/15 text-info",
                          membership.status === "SUSPENDED" &&
                            "bg-warning/15 text-warning",
                          membership.status === "REMOVED" &&
                            "bg-muted text-muted-foreground",
                        )}
                      >
                        {membership.status === "ACTIVE" ||
                        membership.status === "INVITED" ||
                        membership.status === "SUSPENDED" ||
                        membership.status === "REMOVED"
                          ? t(`status.${membership.status}`)
                          : membership.status}
                      </Badge>
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
                          {membership.status !== "ACTIVE" && (
                            <DropdownMenuItem
                              onSelect={() =>
                                updateMutation.mutate({
                                  id: membership.id,
                                  input: { status: "ACTIVE" },
                                })
                              }
                            >
                              {t("actions.activate")}
                            </DropdownMenuItem>
                          )}
                          {membership.status !== "SUSPENDED" &&
                            membership.status !== "REMOVED" && (
                              <DropdownMenuItem
                                onSelect={() =>
                                  updateMutation.mutate({
                                    id: membership.id,
                                    input: { status: "SUSPENDED" },
                                  })
                                }
                              >
                                {t("actions.suspend")}
                              </DropdownMenuItem>
                            )}
                          <DropdownMenuSeparator />
                          {membership.status !== "REMOVED" && (
                            <DropdownMenuItem
                              variant="destructive"
                              onSelect={() => setRemoving(membership)}
                            >
                              {t("actions.remove")}
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
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

      <AlertDialog
        open={Boolean(removing)}
        onOpenChange={(open) => !open && setRemoving(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("removeTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {removing
                ? t("removeDescription", {
                    name: formatPersonName(
                      removing.user.firstName,
                      removing.user.lastName,
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
                if (removing) {
                  updateMutation.mutate({
                    id: removing.id,
                    input: { status: "REMOVED" },
                  });
                }
              }}
            >
              {t("actions.remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
