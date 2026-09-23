"use client";

import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { useAuth } from "@/components/providers/auth-provider";
import { parentsQueryKey } from "@/components/parents/parents-page";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/types";
import type { GuardianLink } from "@/lib/api/types";
import { parentsApi, studentsApi } from "@/lib/api/resources";
import { formatDate, formatPersonName } from "@/lib/format";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Link2, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { toast } from "sonner";

type ParentDetailPageProps = {
  parentId: string;
};

export function ParentDetailPage({ parentId }: ParentDetailPageProps) {
  const t = useTranslations("parents");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const { permissions, isSuperAdmin } = useAuth();

  const canLink =
    isSuperAdmin || permissions.includes("students.update");

  const [studentId, setStudentId] = useState("");
  const [relationship, setRelationship] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [canPickup, setCanPickup] = useState(true);
  const [linkedSession, setLinkedSession] = useState<
    Array<GuardianLink & { studentName: string }>
  >([]);

  const parentQuery = useQuery({
    queryKey: [...parentsQueryKey, "detail", parentId],
    queryFn: () => parentsApi.get(parentId),
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "for-parent-link"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 100 }),
    enabled: canLink,
    staleTime: 30_000,
  });

  const studentOptions = useMemo(
    () => studentsQuery.data?.data ?? [],
    [studentsQuery.data],
  );

  const linkMutation = useMutation({
    mutationFn: async () => {
      const student = studentOptions.find((s) => s.id === studentId);
      if (!student) throw new Error("Student required");
      const link = await studentsApi.linkGuardian(studentId, {
        parentProfileId: parentId,
        relationship: relationship.trim(),
        isPrimary,
        isEmergency,
        canPickup,
      });
      return {
        ...link,
        studentName: formatPersonName(student.firstName, student.lastName),
      };
    },
    onSuccess: (link) => {
      toast.success(t("toasts.linked"));
      setLinkedSession((prev) => [link, ...prev]);
      setStudentId("");
      setRelationship("");
      setIsPrimary(false);
      setIsEmergency(false);
      setCanPickup(true);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  if (parentQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (parentQuery.isError || !parentQuery.data) {
    return (
      <ErrorState
        message={
          parentQuery.error instanceof ApiError
            ? parentQuery.error.message
            : t("notFound")
        }
        onRetry={() => void parentQuery.refetch()}
      />
    );
  }

  const parent = parentQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit">
          <Link href="/parents">
            <ArrowLeft className="size-4 rtl:rotate-180" />
            {tCommon("back")}
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">
          {formatPersonName(parent.firstName, parent.lastName)}
        </h1>
        <p className="text-sm text-muted-foreground">{parent.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("profileTitle")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label={t("fields.email")} value={parent.email} />
            <InfoRow label={t("fields.phone")} value={parent.phone} />
            <InfoRow
              label={t("fields.createdAt")}
              value={formatDate(parent.createdAt, locale)}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("inviteStatusTitle")}</CardTitle>
            <CardDescription>{t("inviteStatusDescription")}</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {canLink && (
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("linkTitle")}</CardTitle>
            <CardDescription>{t("linkSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>{t("fields.student")}</Label>
              <Select value={studentId || undefined} onValueChange={setStudentId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("fields.studentPlaceholder")} />
                </SelectTrigger>
                <SelectContent>
                  {studentOptions.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {formatPersonName(student.firstName, student.lastName)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="relationship">{t("fields.relationship")}</Label>
              <Input
                id="relationship"
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                placeholder={t("fields.relationshipPlaceholder")}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isPrimary}
                onCheckedChange={(v) => setIsPrimary(v === true)}
              />
              {t("fields.isPrimary")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={isEmergency}
                onCheckedChange={(v) => setIsEmergency(v === true)}
              />
              {t("fields.isEmergency")}
            </label>
            <label className="flex items-center gap-2 text-sm sm:col-span-2">
              <Checkbox
                checked={canPickup}
                onCheckedChange={(v) => setCanPickup(v === true)}
              />
              {t("fields.canPickup")}
            </label>
            <div className="sm:col-span-2">
              <Button
                type="button"
                disabled={
                  !studentId ||
                  !relationship.trim() ||
                  linkMutation.isPending
                }
                onClick={() => linkMutation.mutate()}
              >
                <Plus className="size-4" />
                {t("linkSubmit")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">{t("childrenTitle")}</CardTitle>
          <CardDescription>{t("childrenDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          {linkedSession.length === 0 ? (
            <EmptyState
              title={t("childrenEmptyTitle")}
              description={t("childrenEmptyDescription")}
            />
          ) : (
            <ul className="space-y-2">
              {linkedSession.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Link2 className="size-4 text-muted-foreground" />
                    <div>
                      <Link
                        href={`/students/${link.studentId}`}
                        className="font-medium hover:text-primary"
                      >
                        {link.studentName}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {link.relationship}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground sm:text-end">
        {value?.trim() ? value : "—"}
      </span>
    </div>
  );
}
