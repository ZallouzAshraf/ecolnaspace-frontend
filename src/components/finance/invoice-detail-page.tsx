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
import type { CreatePaymentInput, InvoiceStatus } from "@/lib/api/types";
import { invoicesApi } from "@/lib/api/resources";
import { formatDate, formatPersonName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { invoicesQueryKey } from "@/components/finance/invoices-page";

const PAYMENT_METHODS = ["CASH", "CARD", "BANK_TRANSFER", "CHECK", "OTHER"];

function formatMoney(value: string | number, currency: string) {
  const n = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(n)) return String(value);
  return `${n.toFixed(2)} ${currency}`;
}

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
    default:
      return "border-transparent bg-muted text-muted-foreground";
  }
}

type InvoiceDetailPageProps = {
  invoiceId: string;
};

export function InvoiceDetailPage({ invoiceId }: InvoiceDetailPageProps) {
  const t = useTranslations("invoices");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canUpdate = isSuperAdmin || permissions.includes("invoices.update");
  const canPay = isSuperAdmin || permissions.includes("payments.create");

  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");

  const detailQuery = useQuery({
    queryKey: [...invoicesQueryKey, "detail", invoiceId],
    queryFn: () => invoicesApi.get(invoiceId),
  });

  const issueMutation = useMutation({
    mutationFn: () => invoicesApi.issue(invoiceId),
    onSuccess: async () => {
      toast.success(t("toasts.issued"));
      await queryClient.invalidateQueries({ queryKey: invoicesQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const payMutation = useMutation({
    mutationFn: (input: CreatePaymentInput) =>
      invoicesApi.addPayment(invoiceId, input, crypto.randomUUID()),
    onSuccess: async () => {
      toast.success(t("toasts.paymentAdded"));
      setPayOpen(false);
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

  if (detailQuery.isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (detailQuery.isError) {
    return (
      <ErrorState
        message={
          detailQuery.error instanceof ApiError
            ? detailQuery.error.message
            : undefined
        }
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const invoice = detailQuery.data;
  if (!invoice) {
    return <EmptyState title={t("notFound")} />;
  }

  const remaining =
    Number(invoice.total) - Number(invoice.amountPaid);

  function openPay() {
    setAmount(remaining > 0 ? remaining.toFixed(2) : "");
    setPayOpen(true);
  }

  function handlePay(e: React.FormEvent) {
    e.preventDefault();
    if (!invoice) return;
    const n = Number(amount);
    if (!n || n <= 0) {
      toast.error(t("errors.amount"));
      return;
    }
    void payMutation.mutateAsync({
      amount: n,
      method,
      reference: reference.trim() || undefined,
      currency: invoice.currency,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            <Link href="/finance/invoices" className="hover:text-primary">
              {t("title")}
            </Link>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">
            {invoice.invoiceNumber || t("draftLabel")}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "rounded-full",
                invoiceStatusClass(invoice.status),
              )}
            >
              {t(`status.${invoice.status}`)}
            </Badge>
            {invoice.student && (
              <span className="text-sm text-muted-foreground">
                {formatPersonName(
                  invoice.student.firstName,
                  invoice.student.lastName,
                )}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canUpdate && invoice.status === "DRAFT" && (
            <Button
              type="button"
              onClick={() => issueMutation.mutate()}
              disabled={issueMutation.isPending}
            >
              {t("actions.issue")}
            </Button>
          )}
          {canPay &&
            ["ISSUED", "PARTIALLY_PAID", "OVERDUE"].includes(
              invoice.status,
            ) && (
              <Button type="button" variant="outline" onClick={openPay}>
                {t("actions.addPayment")}
              </Button>
            )}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">{t("columns.total")}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {formatMoney(invoice.total, invoice.currency)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">{t("columns.paid")}</p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {formatMoney(invoice.amountPaid, invoice.currency)}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">
            {t("columns.remaining")}
          </p>
          <p className="mt-1 text-lg font-semibold tabular-nums">
            {formatMoney(Math.max(0, remaining), invoice.currency)}
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-base font-medium">{t("itemsTitle")}</h2>
        {(invoice.items ?? []).length === 0 ? (
          <EmptyState title={t("itemsEmpty")} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("fields.description")}</TableHead>
                  <TableHead className="text-end">
                    {t("fields.quantity")}
                  </TableHead>
                  <TableHead className="text-end">
                    {t("fields.unitPrice")}
                  </TableHead>
                  <TableHead className="text-end">{t("columns.lineTotal")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoice.items ?? []).map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-end tabular-nums">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatMoney(item.unitPrice, invoice.currency)}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatMoney(
                        item.lineTotal ??
                          Number(item.quantity) * Number(item.unitPrice),
                        invoice.currency,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-medium">{t("paymentsTitle")}</h2>
        {(invoice.payments ?? []).length === 0 ? (
          <EmptyState title={t("paymentsEmpty")} />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.paidAt")}</TableHead>
                  <TableHead>{t("fields.method")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("fields.reference")}
                  </TableHead>
                  <TableHead className="text-end">{t("columns.amount")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(invoice.payments ?? []).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {formatDate(payment.paidAt, locale)}
                    </TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {payment.reference || "—"}
                    </TableCell>
                    <TableCell className="text-end tabular-nums">
                      {formatMoney(payment.amount, payment.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      <Sheet open={payOpen} onOpenChange={setPayOpen}>
        <SheetContent
          side={rtl ? "left" : "right"}
          className="flex w-full flex-col sm:max-w-md"
        >
          <SheetHeader>
            <SheetTitle>{t("paymentTitle")}</SheetTitle>
            <SheetDescription>{t("paymentSubtitle")}</SheetDescription>
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
                        {t(`methods.${m}`)}
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
                onClick={() => setPayOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={payMutation.isPending}>
                {t("actions.recordPayment")}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
