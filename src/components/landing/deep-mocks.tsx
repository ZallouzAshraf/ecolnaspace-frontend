import { cn } from "@/lib/utils";
import { Building2, Check, Shield, Utensils, Moon, Users } from "lucide-react";

type CampusesMockProps = {
  labels: {
    org: string;
    campuses: string;
    active: string;
    staff: string;
    students: string;
    campusA: string;
    campusB: string;
    campusC: string;
  };
  className?: string;
};

export function CampusesMock({ labels, className }: CampusesMockProps) {
  const campuses = [
    { name: labels.campusA, staff: "18", students: "142", tone: "primary" },
    { name: labels.campusB, staff: "12", students: "96", tone: "sky" },
    { name: labels.campusC, staff: "9", students: "64", tone: "emerald" },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_30px_60px_-30px_rgba(30,27,75,0.35)] ring-1 ring-slate-900/5",
        className,
      )}
      dir="ltr"
      role="img"
      aria-label={labels.campuses}
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 bg-linear-to-b from-slate-50 to-white px-4 py-3.5">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-primary" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-foreground">{labels.org}</p>
            <p className="text-[11px] text-muted-foreground">{labels.campuses}</p>
          </div>
        </div>
        <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          {labels.active}
        </span>
      </div>
      <div className="space-y-2.5 p-4">
        {campuses.map((campus) => (
          <div
            key={campus.name}
            className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors hover:border-primary/25"
          >
            <div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-lg",
                campus.tone === "primary" && "bg-primary/10 text-primary",
                campus.tone === "sky" && "bg-sky-500/10 text-sky-600",
                campus.tone === "emerald" && "bg-emerald-500/10 text-emerald-600",
              )}
            >
              <Building2 className="size-4" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {campus.name}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {campus.staff} {labels.staff} · {campus.students} {labels.students}
              </p>
            </div>
            <Check className="size-3.5 shrink-0 text-emerald-500" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}

type RolesMockProps = {
  labels: {
    title: string;
    admin: string;
    teacher: string;
    parent: string;
    adminDesc: string;
    teacherDesc: string;
    parentDesc: string;
    active: string;
  };
  className?: string;
};

export function RolesMock({ labels, className }: RolesMockProps) {
  const roles = [
    {
      role: labels.admin,
      desc: labels.adminDesc,
      color: "bg-primary/10 text-primary",
    },
    {
      role: labels.teacher,
      desc: labels.teacherDesc,
      color: "bg-sky-500/10 text-sky-700",
    },
    {
      role: labels.parent,
      desc: labels.parentDesc,
      color: "bg-emerald-500/10 text-emerald-700",
    },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_30px_60px_-30px_rgba(30,27,75,0.35)] ring-1 ring-slate-900/5",
        className,
      )}
      dir="ltr"
      role="img"
      aria-label={labels.title}
    >
      <div className="flex items-center gap-2 border-b border-slate-200/70 bg-linear-to-b from-slate-50 to-white px-4 py-3.5">
        <Shield className="size-4 text-primary" aria-hidden />
        <p className="text-sm font-semibold text-foreground">{labels.title}</p>
      </div>
      <div className="grid gap-0 sm:grid-cols-3">
        {roles.map((item, index) => (
          <div
            key={item.role}
            className={cn(
              "space-y-3 p-4",
              index < roles.length - 1 && "border-b border-border sm:border-b-0 sm:border-e",
            )}
          >
            <div
              className={cn(
                "inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold",
                item.color,
              )}
            >
              {item.role}
            </div>
            <div className="space-y-1.5">
              <div className="h-2 w-full rounded bg-slate-200" />
              <div className="h-2 w-[80%] rounded bg-slate-200" />
              <div className="h-2 w-[60%] rounded bg-slate-100" />
            </div>
            <p className="text-[11px] leading-snug text-muted-foreground">
              {item.desc}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-600">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {labels.active}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type DaycareMockProps = {
  labels: {
    title: string;
    date: string;
    meals: string;
    naps: string;
    pickups: string;
    lunch: string;
    consumed: string;
    napDone: string;
    verified: string;
    childA: string;
    childB: string;
    childC: string;
  };
  className?: string;
};

export function DaycareMock({ labels, className }: DaycareMockProps) {
  const rows = [
    {
      child: labels.childA,
      icon: Utensils,
      event: labels.lunch,
      status: labels.consumed,
      tone: "text-emerald-600 bg-emerald-500/10",
    },
    {
      child: labels.childB,
      icon: Moon,
      event: labels.naps,
      status: labels.napDone,
      tone: "text-sky-600 bg-sky-500/10",
    },
    {
      child: labels.childC,
      icon: Users,
      event: labels.pickups,
      status: labels.verified,
      tone: "text-primary bg-primary/10",
    },
  ];

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-[0_30px_60px_-30px_rgba(30,27,75,0.35)] ring-1 ring-slate-900/5",
        className,
      )}
      dir="ltr"
      role="img"
      aria-label={labels.title}
    >
      <div className="flex items-center justify-between border-b border-slate-200/70 bg-linear-to-b from-slate-50 to-white px-4 py-3.5">
        <div>
          <p className="text-sm font-semibold text-foreground">{labels.title}</p>
          <p className="text-[11px] text-muted-foreground">{labels.date}</p>
        </div>
        <div className="hidden gap-1.5 sm:flex">
          {[labels.meals, labels.naps, labels.pickups].map((tab, i) => (
            <span
              key={tab}
              className={cn(
                "rounded-md px-2 py-1 text-[10px] font-medium",
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground",
              )}
            >
              {tab}
            </span>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.child + row.event}
              className="flex items-center gap-3 px-4 py-3"
            >
              <div
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg",
                  row.tone,
                )}
              >
                <Icon className="size-4" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {row.child}
                </p>
                <p className="text-[11px] text-muted-foreground">{row.event}</p>
              </div>
              <span className="shrink-0 rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-foreground">
                {row.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
