"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/components/providers/auth-provider";
import { campusesApi, studentsApi, teachersApi } from "@/lib/api/resources";
import { Link } from "@/i18n/navigation";
import { useQuery } from "@tanstack/react-query";
import { Building2, Check, GraduationCap, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";

export function DashboardView() {
  const t = useTranslations("dashboard");
  const { displayName, permissions, isSuperAdmin } = useAuth();

  const canReadCampuses = isSuperAdmin || permissions.includes("campuses.read");
  const canReadTeachers = isSuperAdmin || permissions.includes("teachers.read");
  const canReadStudents = isSuperAdmin || permissions.includes("students.read");

  const campusesQuery = useQuery({
    queryKey: ["campuses", "onboarding"],
    queryFn: () => campusesApi.list(),
    enabled: canReadCampuses,
    retry: false,
  });

  const studentsQuery = useQuery({
    queryKey: ["students", "onboarding"],
    queryFn: () => studentsApi.list({ page: 1, pageSize: 1 }),
    enabled: canReadStudents,
    retry: false,
  });

  const teachersQuery = useQuery({
    queryKey: ["teachers", "onboarding"],
    queryFn: () => teachersApi.list({ page: 1, pageSize: 1 }),
    enabled: canReadTeachers,
    retry: false,
  });

  const loading =
    (canReadCampuses && campusesQuery.isLoading) ||
    (canReadTeachers && teachersQuery.isLoading) ||
    (canReadStudents && studentsQuery.isLoading);

  const campusDone = (campusesQuery.data?.length ?? 0) > 0;
  const teacherDone = (teachersQuery.data?.meta.total ?? 0) > 0;
  const studentDone = (studentsQuery.data?.meta.total ?? 0) > 0;
  const allDone = campusDone && teacherDone && studentDone;

  const steps = [
    {
      key: "stepCampus" as const,
      href: "/organization/campuses",
      icon: Building2,
      done: campusDone,
      visible: canReadCampuses,
    },
    {
      key: "stepTeacher" as const,
      href: "/teachers",
      icon: UserPlus,
      done: teacherDone,
      visible: canReadTeachers,
    },
    {
      key: "stepStudent" as const,
      href: "/students",
      icon: GraduationCap,
      done: studentDone,
      visible: canReadStudents,
    },
  ].filter((s) => s.visible);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {displayName ? t("welcome", { name: displayName }) : t("welcomeGeneric")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : !allDone && steps.length > 0 ? (
        <Card size="sm" className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{t("onboardingTitle")}</CardTitle>
            <CardDescription>{t("onboardingSubtitle")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {steps.map((step) => {
              const Icon = step.done ? Check : step.icon;
              return (
                <div
                  key={step.key}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={
                        step.done
                          ? "flex size-8 items-center justify-center rounded-lg bg-success/15 text-success"
                          : "flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
                      }
                    >
                      <Icon className="size-4" aria-hidden />
                    </div>
                    <span className="text-sm font-medium">{t(step.key)}</span>
                  </div>
                  {!step.done && (
                    <Button asChild size="sm" variant="outline">
                      <Link href={step.href}>{t(step.key)}</Link>
                    </Button>
                  )}
                </div>
              );
            })}
            <p className="pt-1 text-xs text-muted-foreground">{t("emptyHint")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
          <p className="text-sm font-medium text-foreground">{t("title")}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{t("readyHint")}</p>
        </div>
      )}
    </div>
  );
}
