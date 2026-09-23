"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { daycareApi, studentsApi } from "@/lib/api/resources";
import { formatDate, formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export const pickupsQueryKey = ["daycare", "pickups"] as const;

function todayDateString() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function PickupsPage() {
  const t = useTranslations("pickups");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canManage =
    isSuperAdmin || permissions.includes("daycare.pickups.manage");

  const [date, setDate] = useState(todayDateString);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [pickupPersonName, setPickupPersonName] = useState("");
  const [verified, setVerified] = useState(true);
  const [notes, setNotes] = useState("");

  const listQuery = useQuery({
    queryKey: [...pickupsQueryKey, date],
    queryFn: () =>
      daycareApi.listPickups({
        from: date,
        to: date,
        page: 1,
      }),
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "options"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: sheetOpen,
  });

  const createMutation = useMutation({
    mutationFn: () =>
      daycareApi.createPickup({
        studentId,
        pickupPersonName: pickupPersonName.trim(),
        verified,
        notes: notes.trim() || undefined,
        arrivedAt: new Date().toISOString(),
      }),
    onSuccess: async () => {
      toast.success(t("toasts.created"));
      setSheetOpen(false);
      setStudentId("");
      setPickupPersonName("");
      setVerified(true);
      setNotes("");
      await queryClient.invalidateQueries({ queryKey: pickupsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId || !pickupPersonName.trim()) {
      toast.error(t("errors.required"));
      return;
    }
    void createMutation.mutateAsync();
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
          <Button type="button" onClick={() => setSheetOpen(true)}>
            <Plus className="size-4" />
            {t("add")}
          </Button>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:w-44">
        <Label htmlFor="pickups-date">{t("filters.date")}</Label>
        <Input
          id="pickups-date"
          type="date"
          className="mt-1.5"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
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
              <Button type="button" onClick={() => setSheetOpen(true)}>
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
                <TableHead>{t("columns.person")}</TableHead>
                <TableHead>{t("columns.verified")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("columns.arrivedAt")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((pickup) => (
                <TableRow key={pickup.id}>
                  <TableCell className="font-medium">
                    {pickup.student
                      ? formatPersonName(
                          pickup.student.firstName,
                          pickup.student.lastName,
                        )
                      : pickup.studentId}
                  </TableCell>
                  <TableCell>{pickup.pickupPersonName}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        pickup.verified
                          ? "rounded-full border-transparent bg-success/15 text-success"
                          : "rounded-full border-transparent bg-muted text-muted-foreground"
                      }
                    >
                      {pickup.verified ? tCommon("yes") : tCommon("no")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-muted-foreground">
                    {pickup.arrivedAt
                      ? formatDate(pickup.arrivedAt, locale, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
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
            className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4"
            onSubmit={handleSubmit}
          >
            <div className="flex-1 space-y-4 overflow-y-auto">
              <div className="space-y-1.5">
                <Label>{t("fields.student")}</Label>
                <Select value={studentId || undefined} onValueChange={setStudentId}>
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
                <Label htmlFor="pickup-person">{t("fields.person")}</Label>
                <Input
                  id="pickup-person"
                  value={pickupPersonName}
                  onChange={(e) => setPickupPersonName(e.target.value)}
                  required
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={verified}
                  onCheckedChange={(v) => setVerified(v === true)}
                />
                {t("fields.verified")}
              </label>
              <div className="space-y-1.5">
                <Label htmlFor="pickup-notes">{t("fields.notes")}</Label>
                <Textarea
                  id="pickup-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
              <Button type="submit" disabled={createMutation.isPending}>
                {tCommon("save")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
