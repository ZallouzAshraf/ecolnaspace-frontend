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
import { Link, useRouter } from "@/i18n/navigation";
import { isRtlLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/types";
import type {
  CreateInvoiceInput,
  Invoice,
  InvoiceItemInput,
  InvoiceStatus,
} from "@/lib/api/types";
import { invoicesApi, studentsApi } from "@/lib/api/resources";
import { formatPersonName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export const invoicesQueryKey = ["invoices"] as const;

const STATUSES: Array<InvoiceStatus | "__all__"> = [
  "__all__",
  "DRAFT",
  "ISSUED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
];

function invoiceStatusClass(status: InvoiceStatus) {
  switch (status) {
    case "DRAFT":
      return "border-transparent bg-muted text-muted-foreground";
    case "ISSUED":
      return "border-transparent bg-primary/15 text-primary";
    case "PARTIALLY_PAID":
      return "border-transparent bg-warning/15 text-warning";
    case "PAID":
      return "border-transparent bg-success/15 text-success";
    case "OVERDUE":
      return "border-transparent bg-destructive/15 text-destructive";
    case "CANCELLED":
      return "border-transparent bg-muted text-muted-foreground";
    default:
      return "";
  }
}

function formatMoney(value: string | number, currency: string) {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return `${n.toFixed(2)} ${currency}`;
}

type DraftItem = InvoiceItemInput;

export function InvoicesPage() {
  const t = useTranslations("invoices");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canCreate = isSuperAdmin || permissions.includes("invoices.create");

  const [statusFilter, setStatusFilter] = useState<string>("__all__");
  const [page, setPage] = useState(1);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<DraftItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);

  const listQuery = useQuery({
    queryKey: [...invoicesQueryKey, "list", statusFilter, page],
    queryFn: () =>
      invoicesApi.list({
        page,
        pageSize: 20,
        status: statusFilter === "__all__" ? undefined : statusFilter,
      }),
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "options"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: sheetOpen,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateInvoiceInput) => invoicesApi.create(input),
    onSuccess: async (invoice) => {
      toast.success(t("toasts.created"));
      setSheetOpen(false);
      resetForm();
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKey });
      router.push(`/finance/invoices/${invoice.id}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function resetForm() {
    setStudentId("");
    setNotes("");
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
  }

  function openCreate() {
    resetForm();
    setSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = items
      .map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }))
      .filter((item) => item.description && item.quantity > 0);

    if (cleaned.length === 0) {
      toast.error(t("errors.items"));
      return;
    }

    void createMutation.mutateAsync({
      studentId: studentId || undefined,
      notes: notes.trim() || undefined,
      items: cleaned,
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

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm sm:w-56">
        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("filters.status")} />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "__all__"
                  ? t("filters.allStatuses")
                  : t(`status.${status}`)}
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
                  <TableHead>{t("columns.number")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("columns.student")}
                  </TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead className="text-end">{t("columns.total")}</TableHead>
                  <TableHead className="w-12 text-end">
                    <span className="sr-only">{tCommon("actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((invoice: Invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        href={`/finance/invoices/${invoice.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {invoice.invoiceNumber || t("draftLabel")}
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {invoice.student
                        ? formatPersonName(
                            invoice.student.firstName,
                            invoice.student.lastName,
                          )
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full",
                          invoiceStatusClass(invoice.status),
                        )}
                      >
                        {t(`status.${invoice.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatMoney(invoice.total, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(`/finance/invoices/${invoice.id}`)
                        }
                      >
                        {t("actions.view")}
                      </Button>
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
                <Select
                  value={studentId || "__none__"}
                  onValueChange={(v) =>
                    setStudentId(v === "__none__" ? "" : v)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("fields.studentPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">
                      {t("fields.noStudent")}
                    </SelectItem>
                    {(studentsQuery.data?.data ?? []).map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {formatPersonName(student.firstName, student.lastName)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t("fields.items")}</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setItems((prev) => [
                        ...prev,
                        { description: "", quantity: 1, unitPrice: 0 },
                      ])
                    }
                  >
                    <Plus className="size-3.5" />
                    {t("actions.addItem")}
                  </Button>
                </div>
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-2 rounded-lg border border-border p-3"
                  >
                    <Input
                      placeholder={t("fields.description")}
                      value={item.description}
                      onChange={(e) =>
                        setItems((prev) =>
                          prev.map((row, i) =>
                            i === index
                              ? { ...row, description: e.target.value }
                              : row,
                          ),
                        )
                      }
                      required
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        placeholder={t("fields.quantity")}
                        value={item.quantity}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row, i) =>
                              i === index
                                ? {
                                    ...row,
                                    quantity: Number(e.target.value) || 0,
                                  }
                                : row,
                            ),
                          )
                        }
                        required
                      />
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder={t("fields.unitPrice")}
                        value={item.unitPrice}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((row, i) =>
                              i === index
                                ? {
                                    ...row,
                                    unitPrice: Number(e.target.value) || 0,
                                  }
                                : row,
                            ),
                          )
                        }
                        required
                      />
                    </div>
                    {items.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() =>
                          setItems((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <Trash2 className="size-3.5" />
                        {t("actions.removeItem")}
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="invoice-notes">{t("fields.notes")}</Label>
                <Input
                  id="invoice-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                {t("actions.createDraft")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
