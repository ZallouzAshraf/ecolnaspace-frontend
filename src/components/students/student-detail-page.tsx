"use client";

import { StudentDocumentsPanel } from "@/components/documents/documents-page";
import { EmptyState, ErrorState } from "@/components/feedback/page-states";
import { StudentFormSheet } from "@/components/students/student-form-sheet";
import { StudentStatusBadge } from "@/components/students/student-status-badge";
import { studentsQueryKey } from "@/components/students/students-page";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/types";
import type { CreatePickupPersonInput, StudentInput } from "@/lib/api/types";
import {
  academicYearsApi,
  campusesApi,
  classesApi,
  enrollmentsApi,
  reportCardsApi,
  studentsApi,
} from "@/lib/api/resources";
import {
  calculateAge,
  formatDate,
  formatPersonName,
} from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Pencil, Plus, Printer } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

type StudentDetailPageProps = {
  studentId: string;
};

export function StudentDetailPage({ studentId }: StudentDetailPageProps) {
  const t = useTranslations("students");
  const tCommon = useTranslations("common");
  const tReport = useTranslations("reportCards");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { permissions, isSuperAdmin } = useAuth();

  const canUpdate = isSuperAdmin || permissions.includes("students.update");
  const canEditMedical =
    isSuperAdmin || permissions.includes("students.medical.read");
  const canEnroll =
    isSuperAdmin || permissions.includes("enrollments.manage");
  const canReadDocuments =
    isSuperAdmin || permissions.includes("documents.read");
  const canReadReportCards =
    isSuperAdmin || permissions.includes("report-cards.read");

  const [sheetOpen, setSheetOpen] = useState(false);
  const [pickupName, setPickupName] = useState("");
  const [pickupPhone, setPickupPhone] = useState("");
  const [pickupRelationship, setPickupRelationship] = useState("");
  const [enrollClassId, setEnrollClassId] = useState("");
  const [reportYearId, setReportYearId] = useState("");

  const studentQuery = useQuery({
    queryKey: [...studentsQueryKey, "detail", studentId],
    queryFn: () => studentsApi.get(studentId),
  });

  const campusesQuery = useQuery({
    queryKey: ["campuses"],
    queryFn: () => campusesApi.list(),
    staleTime: 60_000,
  });

  const pickupsQuery = useQuery({
    queryKey: [...studentsQueryKey, "pickups", studentId],
    queryFn: () => studentsApi.listPickupPersons(studentId),
  });

  const enrollmentsQuery = useQuery({
    queryKey: ["enrollments", "student", studentId],
    queryFn: () => enrollmentsApi.listByStudent(studentId),
    retry: false,
  });

  const classesQuery = useQuery({
    queryKey: ["classes"],
    queryFn: () => classesApi.list(),
    staleTime: 60_000,
    enabled: canEnroll,
  });

  const academicYearsQuery = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => academicYearsApi.list(),
    staleTime: 60_000,
    enabled: canReadReportCards,
  });

  const reportCardQuery = useQuery({
    queryKey: ["report-cards", studentId, reportYearId || "current"],
    queryFn: () =>
      reportCardsApi.get(studentId, reportYearId || undefined),
    enabled: canReadReportCards,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (input: StudentInput) => studentsApi.update(studentId, input),
    onSuccess: async () => {
      toast.success(t("toasts.updated"));
      setSheetOpen(false);
      await queryClient.invalidateQueries({ queryKey: studentsQueryKey });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const pickupMutation = useMutation({
    mutationFn: (input: CreatePickupPersonInput) =>
      studentsApi.addPickupPerson(studentId, input),
    onSuccess: async () => {
      toast.success(t("toasts.pickupAdded"));
      setPickupName("");
      setPickupPhone("");
      setPickupRelationship("");
      await queryClient.invalidateQueries({
        queryKey: [...studentsQueryKey, "pickups", studentId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  const enrollMutation = useMutation({
    mutationFn: (classId: string) =>
      enrollmentsApi.create({ studentId, classId }),
    onSuccess: async () => {
      toast.success(t("toasts.enrolled"));
      setEnrollClassId("");
      await queryClient.invalidateQueries({
        queryKey: ["enrollments", "student", studentId],
      });
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : tCommon("errorGeneric"),
      );
    },
  });

  if (studentQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (studentQuery.isError || !studentQuery.data) {
    return (
      <ErrorState
        message={
          studentQuery.error instanceof ApiError
            ? studentQuery.error.message
            : t("notFound")
        }
        onRetry={() => void studentQuery.refetch()}
      />
    );
  }

  const student = studentQuery.data;
  const age = calculateAge(student.dateOfBirth);
  const campusName = campusesQuery.data?.find(
    (c) => c.id === student.campusId,
  )?.name;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Button asChild variant="ghost" size="sm" className="-ms-2 w-fit">
            <Link href="/students">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {tCommon("back")}
            </Link>
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {formatPersonName(
                student.firstName,
                student.lastName,
                student.preferredName,
              )}
            </h1>
            <StudentStatusBadge status={student.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {formatDate(student.dateOfBirth, locale)}
            {age !== null ? ` · ${t("ageYears", { count: age })}` : ""}
            {campusName ? ` · ${campusName}` : ""}
          </p>
        </div>
        {canUpdate && (
          <Button type="button" variant="outline" onClick={() => setSheetOpen(true)}>
            <Pencil className="size-4" />
            {t("actions.edit")}
          </Button>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList variant="line" className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
          <TabsTrigger value="enrollments">{t("tabs.enrollments")}</TabsTrigger>
          <TabsTrigger value="pickups">{t("tabs.pickups")}</TabsTrigger>
          <TabsTrigger value="medical">{t("tabs.medical")}</TabsTrigger>
          {canReadDocuments && (
            <TabsTrigger value="documents">{t("tabs.documents")}</TabsTrigger>
          )}
          {canReadReportCards && (
            <TabsTrigger value="reportCard">{t("tabs.reportCard")}</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{t("form.contact")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow label={t("fields.email")} value={student.email} />
                <InfoRow label={t("fields.phone")} value={student.phone} />
                <InfoRow
                  label={t("fields.campus")}
                  value={campusName}
                />
                <InfoRow
                  label={t("fields.externalRef")}
                  value={student.externalRef}
                />
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{t("form.address")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow
                  label={t("fields.addressLine1")}
                  value={student.addressLine1}
                />
                <InfoRow
                  label={t("fields.addressLine2")}
                  value={student.addressLine2}
                />
                <InfoRow label={t("fields.city")} value={student.city} />
                <InfoRow
                  label={t("fields.postalCode")}
                  value={student.postalCode}
                />
                <InfoRow label={t("fields.country")} value={student.country} />
              </CardContent>
            </Card>
            <Card className="shadow-sm md:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">{t("form.emergency")}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
                <InfoRow
                  label={t("fields.emergencyName")}
                  value={student.emergencyName}
                />
                <InfoRow
                  label={t("fields.emergencyPhone")}
                  value={student.emergencyPhone}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="enrollments" className="mt-4 space-y-4">
          {canEnroll && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{t("enrollTitle")}</CardTitle>
                <CardDescription>{t("enrollSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <Label>{t("fields.class")}</Label>
                  <Select
                    value={enrollClassId || undefined}
                    onValueChange={setEnrollClassId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t("fields.classPlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {(classesQuery.data ?? [])
                        .filter(
                          (c) =>
                            !(enrollmentsQuery.data?.data ?? []).some(
                              (e) => e.classId === c.id && e.status === "ACTIVE",
                            ),
                        )
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  disabled={!enrollClassId || enrollMutation.isPending}
                  onClick={() => enrollMutation.mutate(enrollClassId)}
                >
                  <Plus className="size-4" />
                  {t("actions.enroll")}
                </Button>
              </CardContent>
            </Card>
          )}

          {enrollmentsQuery.isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : enrollmentsQuery.isError ? (
            <EmptyState
              title={t("enrollmentsUnavailableTitle")}
              description={t("enrollmentsUnavailableDescription")}
            />
          ) : (enrollmentsQuery.data?.data.length ?? 0) === 0 ? (
            <EmptyState
              title={t("enrollmentsEmptyTitle")}
              description={t("enrollmentsEmptyDescription")}
            />
          ) : (
            <div className="space-y-2">
              {enrollmentsQuery.data?.data.map((enrollment) => (
                <Card key={enrollment.id} className="shadow-sm">
                  <CardContent className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{enrollment.class.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.academicYear.name}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {enrollment.status} ·{" "}
                      {formatDate(enrollment.enrolledOn, locale)}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pickups" className="mt-4 space-y-4">
          {canUpdate && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{t("pickupAddTitle")}</CardTitle>
                <CardDescription>{t("pickupAddSubtitle")}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pickupName">{t("fields.pickupName")}</Label>
                  <Input
                    id="pickupName"
                    value={pickupName}
                    onChange={(e) => setPickupName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pickupPhone">{t("fields.phone")}</Label>
                  <Input
                    id="pickupPhone"
                    value={pickupPhone}
                    onChange={(e) => setPickupPhone(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pickupRelationship">
                    {t("fields.relationship")}
                  </Label>
                  <Input
                    id="pickupRelationship"
                    value={pickupRelationship}
                    onChange={(e) => setPickupRelationship(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-3">
                  <Button
                    type="button"
                    disabled={!pickupName.trim() || pickupMutation.isPending}
                    onClick={() =>
                      pickupMutation.mutate({
                        fullName: pickupName.trim(),
                        phone: pickupPhone.trim() || undefined,
                        relationship: pickupRelationship.trim() || undefined,
                      })
                    }
                  >
                    <Plus className="size-4" />
                    {t("pickupAdd")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {pickupsQuery.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (pickupsQuery.data?.length ?? 0) === 0 ? (
            <EmptyState
              title={t("pickupsEmptyTitle")}
              description={t("pickupsEmptyDescription")}
            />
          ) : (
            <div className="space-y-2">
              {pickupsQuery.data?.map((person) => (
                <Card key={person.id} className="shadow-sm">
                  <CardContent className="flex items-center justify-between gap-3 py-4">
                    <div>
                      <p className="font-medium">{person.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {[person.relationship, person.phone]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {person.isActive ? t("pickupActive") : t("pickupInactive")}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="medical" className="mt-4">
          {student.allergiesNote !== undefined ||
          student.medicalFlags !== undefined ? (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">{t("form.medical")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <InfoRow
                  label={t("fields.allergiesNote")}
                  value={student.allergiesNote}
                />
                <InfoRow
                  label={t("fields.photoConsent")}
                  value={
                    student.photoConsent ? tCommon("yes") : tCommon("no")
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              title={t("medicalRestrictedTitle")}
              description={t("medicalRestrictedDescription")}
            />
          )}
        </TabsContent>

        {canReadDocuments && (
          <TabsContent value="documents" className="mt-4">
            <StudentDocumentsPanel studentId={studentId} compact />
          </TabsContent>
        )}

        {canReadReportCards && (
          <TabsContent value="reportCard" className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-end sm:justify-between">
              <div className="w-full max-w-sm space-y-1.5">
                <Label>{tReport("academicYear")}</Label>
                <Select
                  value={reportYearId || undefined}
                  onValueChange={setReportYearId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={tReport("academicYearPlaceholder")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {(academicYearsQuery.data ?? []).map((year) => (
                      <SelectItem key={year.id} value={year.id}>
                        {year.name}
                        {year.isCurrent ? ` (${tReport("current")})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => window.print()}
                disabled={!reportCardQuery.data}
              >
                <Printer className="size-4" />
                {tReport("print")}
              </Button>
            </div>

            {reportCardQuery.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : reportCardQuery.isError ? (
              <EmptyState
                title={tReport("unavailableTitle")}
                description={
                  reportCardQuery.error instanceof ApiError
                    ? reportCardQuery.error.message
                    : tReport("unavailableDescription")
                }
              />
            ) : !reportCardQuery.data ? (
              <EmptyState
                title={tReport("emptyTitle")}
                description={tReport("emptyDescription")}
              />
            ) : (
              <div className="report-card space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm print:rounded-none print:border-0 print:p-0 print:shadow-none">
                <div className="space-y-1 border-b border-border pb-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    EcolnaSpace
                  </p>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {tReport("title")}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {formatPersonName(
                      reportCardQuery.data.student.firstName,
                      reportCardQuery.data.student.lastName,
                    )}{" "}
                    · {reportCardQuery.data.academicYear.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tReport("generatedAt", {
                      date: formatDate(
                        reportCardQuery.data.generatedAt,
                        locale,
                      ),
                    })}
                  </p>
                </div>

                <section className="space-y-2">
                  <h3 className="text-sm font-medium">
                    {tReport("enrollments")}
                  </h3>
                  {reportCardQuery.data.enrollments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {tReport("noEnrollments")}
                    </p>
                  ) : (
                    <ul className="list-inside list-disc text-sm">
                      {reportCardQuery.data.enrollments.map((enrollment) => (
                        <li key={enrollment.id}>{enrollment.class.name}</li>
                      ))}
                    </ul>
                  )}
                </section>

                <section className="space-y-3">
                  <h3 className="text-sm font-medium">{tReport("grades")}</h3>
                  {reportCardQuery.data.subjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {tReport("noGrades")}
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{tReport("columns.subject")}</TableHead>
                            <TableHead>
                              {tReport("columns.assessment")}
                            </TableHead>
                            <TableHead>{tReport("columns.score")}</TableHead>
                            <TableHead>
                              {tReport("columns.gradedOn")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {reportCardQuery.data.subjects.flatMap((row) =>
                            row.grades.length === 0
                              ? [
                                  <TableRow key={row.subject.id}>
                                    <TableCell className="font-medium">
                                      {row.subject.name}
                                    </TableCell>
                                    <TableCell colSpan={3} className="text-muted-foreground">
                                      —
                                    </TableCell>
                                  </TableRow>,
                                ]
                              : row.grades.map((grade) => (
                                  <TableRow key={grade.id}>
                                    <TableCell className="font-medium">
                                      {row.subject.name}
                                    </TableCell>
                                    <TableCell>{grade.assessment}</TableCell>
                                    <TableCell>
                                      {grade.score} / {grade.maxScore}
                                    </TableCell>
                                    <TableCell>
                                      {formatDate(grade.gradedOn, locale)}
                                    </TableCell>
                                  </TableRow>
                                )),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </section>
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      <StudentFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        campuses={campusesQuery.data ?? []}
        student={student}
        submitting={saveMutation.isPending}
        canEditMedical={canEditMedical}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values);
        }}
      />
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
