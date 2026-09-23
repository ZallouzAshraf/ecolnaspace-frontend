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
import { Link } from "@/i18n/navigation";
import { isRtlLocale } from "@/i18n/routing";
import { ApiError } from "@/lib/api/types";
import type { CreatePaymentInput, Invoice } from "@/lib/api/types";
import { invoicesApi } from "@/lib/api/resources";
import { formatPersonName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQueries, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { invoicesQueryKey } from "@/components/finance/invoices-page";

const PAYABLE_STATUSES = ["ISSUED", "PARTIALLY_PAID", "OVERDUE"] as const;
const PAYMENT_METHODS = ["CASH", "CARD", "BANK_TRANSFER", "CHECK", "OTHER"];

function formatMoney(value: string | number, currency: string) {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return `${n.toFixed(2)} ${currency}`;
}

export function PaymentsPage() {
  const t = useTranslations("payments");
  const tInvoices = useTranslations("invoices");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canPay = isSuperAdmin || permissions.includes("payments.create");

  const [paying, setPaying] = useState<Invoice | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");

  const statusQueries = useQueries({
    queries: PAYABLE_STATUSES.map((status) => ({
      queryKey: [...invoicesQueryKey, "payments-shortcut", status],
      queryFn: () =>
        invoicesApi.list({ status, page: 1, pageSize: 50 }),
    })),
  });

  const isLoading = statusQueries.some((q) => q.isLoading);
  const isError = statusQueries.some((q) => q.isError);
  const firstError = statusQueries.find((q) => q.isError)?.error;

  const rows = useMemo(() => {
    const map = new Map<string, Invoice>();
    for (const q of statusQueries) {
      for (const invoice of q.data?.data ?? []) {
        map.set(invoice.id, invoice);
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  }, [statusQueries]);

  const payMutation = useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: CreatePaymentInput;
    }) => invoicesApi.addPayment(id, input, crypto.randomUUID()),
    onSuccess: async () => {
      toast.success(t("toasts.recorded"));
      setPaying(null);
      setAmount("");
      setMethod("CASH");
      setReference("");
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  function openPay(invoice: Invoice) {
    const remaining = Math.max(
      0,
      Number(invoice.total) - Number(invoice.amountPaid),
    );
    setPaying(invoice);
    setAmount(remaining > 0 ? remaining.toFixed(2) : "");
    setMethod("CASH");
    setReference("");
  }

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!paying) return;
    const n = Number(amount);
    if (!n || n <= 0) {
      toast.error(t("errors.amount"));
      return;
    }
    void payMutation.mutateAsync({
      id: paying.id,
      input: {
        amount: n,
        method,
        reference: reference.trim() || undefined,
        currency: paying.currency,
      },
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          message={
            firstError instanceof ApiError ? firstError.message : undefined
          }
          onRetry={() => {
            for (const q of statusQueries) void q.refetch();
          }}
        />
      ) : rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.invoice")}</TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("columns.student")}
                </TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-end">{t("columns.due")}</TableHead>
                <TableHead className="w-12 text-end">
                  <span className="sr-only">{tCommon("actions")}</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((invoice) => {
                const remaining = Math.max(
                  0,
                  Number(invoice.total) - Number(invoice.amountPaid),
                );
                return (
                  <TableRow key={invoice.id}>
                    <TableCell>
                      <Link
                        href={`/finance/invoices/${invoice.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {invoice.invoiceNumber || invoice.id.slice(0, 8)}
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
                          invoice.status === "OVERDUE"
                            ? "border-transparent bg-destructive/15 text-destructive"
                            : invoice.status === "PARTIALLY_PAID"
                              ? "border-transparent bg-warning/15 text-warning"
                              : "border-transparent bg-primary/15 text-primary",
                        )}
                      >
                        {tInvoices(`status.${invoice.status}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatMoney(remaining, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-end">
                      {canPay && (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => openPay(invoice)}
                        >
                          {t("actions.record")}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet
        open={Boolean(paying)}
        onOpenChange={(open) => !open && setPaying(null)}
      >
        <SheetContent
          side={rtl ? "left" : "right"}
          className="flex w-full flex-col sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle>{t("paymentTitle")}</SheetTitle>
            <SheetDescription>
              {paying
                ? t("paymentSubtitle", {
                    number:
                      paying.invoiceNumber || paying.id.slice(0, 8),
                  })
                : null}
            </SheetDescription>
          </SheetHeader>
          <form
            className="flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4"
            onSubmit={handlePay}
          >
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="pay-amount">{t("fields.amount")}</Label>
                <Input
                  id="pay-amount"
                  type="number"
                  min={0.01}
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("fields.method")}</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {tInvoices(`methods.${m}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pay-ref">{t("fields.reference")}</Label>
                <Input
                  id="pay-ref"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-auto flex justify-end gap-2 border-t border-border pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPaying(null)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={payMutation.isPending}>
                {t("actions.record")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
