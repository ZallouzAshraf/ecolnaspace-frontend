import { cn } from "@/lib/utils";
import {
  BookOpen,
  LayoutGrid,
  MessageSquare,
  Users,
  Wallet,
} from "lucide-react";

type ProductPreviewProps = {
  className?: string;
  elevated?: boolean;
  labels: {
    title: string;
    subtitle: string;
    students: string;
    attendance: string;
    invoices: string;
    present: string;
    late: string;
    paid: string;
  };
};

const NAV = [LayoutGrid, Users, BookOpen, Wallet, MessageSquare];
const BARS = [52, 68, 61, 80, 74, 92, 86];

/** Decorative product UI mock — product chrome stays LTR. */
export function ProductPreview({
  className,
  elevated,
  labels,
}: ProductPreviewProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/70 bg-white/90 ring-1 ring-slate-900/5 backdrop-blur-xl",
        elevated
          ? "shadow-[0_50px_100px_-40px_rgba(30,27,75,0.55),0_24px_48px_-24px_rgba(15,23,42,0.25)]"
          : "shadow-[0_24px_60px_-28px_rgba(15,23,42,0.35)]",
        className,
      )}
      dir="ltr"
      role="img"
      aria-label={labels.title}
    >
      <div className="flex items-center gap-1.5 border-b border-slate-200/70 bg-linear-to-b from-slate-50 to-white px-3.5 py-2.5">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="mx-auto flex items-center gap-1.5 rounded-md bg-slate-100/80 px-2.5 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200/70">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          app.ecolnaspace.com
        </span>
        <span className="w-10" />
      </div>
      <div className="grid grid-cols-[3.25rem_1fr]">
        <aside className="flex flex-col items-center gap-2 border-e border-slate-200/70 bg-slate-50/80 py-3">
          {NAV.map((Icon, i) => (
            <span
              key={i}
              className={cn(
                "flex size-8 items-center justify-center rounded-lg",
                i === 0
                  ? "bg-primary text-white shadow-[0_6px_14px_-6px_rgba(99,91,255,0.8)]"
                  : "text-slate-400",
              )}
            >
              <Icon className="size-4" strokeWidth={1.9} />
            </span>
          ))}
        </aside>
        <div className="space-y-3 bg-linear-to-br from-white via-white to-indigo-50/40 p-3.5 sm:p-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-sm font-semibold tracking-tight text-slate-900">
                {labels.title}
              </p>
              <p className="text-xs text-slate-500">{labels.subtitle}</p>
            </div>
            <div className="flex -space-x-1.5">
              {["bg-violet-400", "bg-sky-400", "bg-emerald-400"].map((c) => (
                <span
                  key={c}
                  className={cn("size-5 rounded-full ring-2 ring-white", c)}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: labels.students, value: "248", delta: "+12" },
              { label: labels.attendance, value: "96%", delta: "+2%" },
              { label: labels.invoices, value: "12", delta: "−3" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200/70 bg-white px-2.5 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
              >
                <p className="truncate text-[10px] text-slate-500">{stat.label}</p>
                <div className="mt-0.5 flex items-baseline gap-1.5">
                  <p className="text-sm font-semibold tabular-nums text-slate-900 sm:text-base">
                    {stat.value}
                  </p>
                  <span className="text-[9px] font-semibold text-emerald-600">
                    {stat.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200/70 bg-white p-2.5">
            <div className="flex h-16 items-end gap-1.5">
              {BARS.map((h, i) => (
                <span
                  key={i}
                  className={cn(
                    "flex-1 rounded-t-md",
                    i === BARS.length - 2
                      ? "bg-linear-to-t from-primary to-violet-400"
                      : "bg-linear-to-t from-indigo-100 to-indigo-200/70",
                  )}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200/70 bg-white">
            {[
              { name: "Amina B.", status: labels.present, tone: "success" },
              { name: "Youssef K.", status: labels.late, tone: "warning" },
              { name: "Sara M.", status: labels.paid, tone: "info" },
            ].map((row, i) => (
              <div
                key={row.name}
                className="flex items-center gap-2.5 border-b border-slate-100 px-2.5 py-2 text-[11px] last:border-b-0"
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white",
                    ["bg-violet-500", "bg-sky-500", "bg-emerald-500"][i],
                  )}
                >
                  {row.name[0]}
                </span>
                <span className="flex-1 truncate font-medium text-slate-800">
                  {row.name}
                </span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    row.tone === "success" && "bg-emerald-50 text-emerald-700",
                    row.tone === "warning" && "bg-amber-50 text-amber-700",
                    row.tone === "info" && "bg-sky-50 text-sky-700",
                  )}
                >
                  {row.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
