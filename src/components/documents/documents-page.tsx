"use client";

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
import type { DocumentRecord } from "@/lib/api/types";
import { documentsApi, studentsApi } from "@/lib/api/resources";
import { formatDate, formatPersonName } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, Upload } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { toast } from "sonner";

export const documentsQueryKey = ["documents"] as const;

const ALL_STUDENTS = "__all__";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type StudentDocumentsPanelProps = {
  /** When set, locks the student filter and hides the student picker. */
  studentId?: string;
  compact?: boolean;
};

export function StudentDocumentsPanel({
  studentId: lockedStudentId,
  compact = false,
}: StudentDocumentsPanelProps) {
  const t = useTranslations("documents");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canRead = isSuperAdmin || permissions.includes("documents.read");
  const canCreate =
    isSuperAdmin || permissions.includes("documents.create");
  const canDelete =
    isSuperAdmin || permissions.includes("documents.delete");

  const [page, setPage] = useState(1);
  const [studentFilter, setStudentFilter] = useState(
    lockedStudentId ?? ALL_STUDENTS,
  );
  const [deleting, setDeleting] = useState<DocumentRecord | null>(null);

  const effectiveStudentId = lockedStudentId ?? (
    studentFilter === ALL_STUDENTS ? undefined : studentFilter
  );

  const studentsQuery = useQuery({
    queryKey: ["students", "options"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 100 }),
    staleTime: 60_000,
    enabled: canRead && !lockedStudentId,
  });

  const listQuery = useQuery({
    queryKey: [
      ...documentsQueryKey,
      "list",
      page,
      effectiveStudentId ?? "all",
    ],
    queryFn: () =>
      documentsApi.list({
        page,
        pageSize: 20,
        studentId: effectiveStudentId,
      }),
    enabled: canRead,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, studentId }: { file: File; studentId?: string }) =>
      documentsApi.upload(file, studentId),
    onSuccess: async () => {
      toast.success(t("toasts.uploaded"));
      if (fileInputRef.current) fileInputRef.current.value = "";
      await queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsApi.remove(id),
    onSuccess: async () => {
      toast.success(t("toasts.deleted"));
      setDeleting(null);
      await queryClient.invalidateQueries({ queryKey: documentsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const downloadMutation = useMutation({
    mutationFn: (doc: DocumentRecord) =>
      documentsApi.download(doc.id, doc.fileName),
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const meta = listQuery.data?.meta;
  const rows = listQuery.data?.data ?? [];

  if (!canRead) {
    return (
      <EmptyState
        title={t("forbiddenTitle")}
        description={t("forbiddenDescription")}
      />
    );
  }

  return (
    <div className={compact ? "space-y-4" : "flex flex-col gap-6"}>
      {!compact && (
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card p-3 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          {!lockedStudentId && (
            <div className="w-full max-w-sm space-y-1.5">
              <Label>{t("filters.student")}</Label>
              <Select
                value={studentFilter}
                onValueChange={(value) => {
                  setStudentFilter(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("filters.studentPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STUDENTS}>
                    {t("filters.allStudents")}
                  </SelectItem>
                  {(studentsQuery.data?.data ?? []).map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {formatPersonName(
                        student.firstName,
                        student.lastName,
                        student.preferredName,
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {canCreate && (
            <div className="flex flex-col gap-2 sm:items-end">
              <input
                ref={fileInputRef}
                type="file"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  uploadMutation.mutate({
                    file,
                    studentId: effectiveStudentId,
                  });
                }}
              />
              <Button
                type="button"
                disabled={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-4" />
                {uploadMutation.isPending ? t("uploading") : t("upload")}
              </Button>
              <p className="text-xs text-muted-foreground">{t("uploadHint")}</p>
            </div>
          )}
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
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.fileName")}</TableHead>
                  <TableHead className="hidden md:table-cell">
                    {t("columns.size")}
                  </TableHead>
                  <TableHead className="hidden lg:table-cell">
                    {t("columns.uploadedAt")}
                  </TableHead>
                  <TableHead className="w-28 text-end">
                    <span className="sr-only">{tCommon("actions")}</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-xs text-muted-foreground md:hidden">
                        {formatBytes(doc.sizeBytes)}
                      </p>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {formatBytes(doc.sizeBytes)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {formatDate(doc.createdAt, locale)}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex justify-end gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={t("actions.download")}
                          disabled={downloadMutation.isPending}
                          onClick={() => downloadMutation.mutate(doc)}
                        >
                          <Download className="size-4" />
                        </Button>
                        {canDelete && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={t("actions.delete")}
                            onClick={() => setDeleting(doc)}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
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
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting
                ? t("deleteDescription", { name: deleting.fileName })
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

export function DocumentsPage() {
  return <StudentDocumentsPanel />;
}
