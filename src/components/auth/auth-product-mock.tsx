"use client";

import { CheckCircle2, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";

export function AuthProductMock() {
  const t = useTranslations("auth.brandPanel");

  return (
    <div className="relative w-full max-w-lg" dir="ltr">
      <div
        aria-hidden
        className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(99,91,255,0.22),transparent_70%)] blur-2xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-white/12 bg-slate-900/70 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.02] px-3.5 py-2.5">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-[#ff5f57]/80" />
            <span className="size-2 rounded-full bg-[#febc2e]/80" />
            <span className="size-2 rounded-full bg-[#28c840]/80" />
          </div>
          <div className="flex flex-1 items-center justify-center gap-2">
            <span className="rounded-md bg-white/8 px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-slate-300">
              app.ecolnaspace.com
            </span>
          </div>
          <span className="size-2 rounded-full bg-emerald-400/90 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
        </div>

        <div className="grid grid-cols-[7.5rem_1fr] sm:grid-cols-[8.5rem_1fr]">
          {/* Mini sidebar */}
          <nav className="border-e border-white/10 bg-white/[0.03] px-2.5 py-3">
            <p className="mb-3 truncate px-1.5 text-[10px] font-semibold tracking-wide text-white">
              {t("mock.orgName")}
            </p>
            <ul className="space-y-0.5">
              {(
                [
                  ["dashboard", true],
                  ["students", false],
                  ["attendance", false],
                  ["payments", false],
                ] as const
              ).map(([key, active]) => (
                <li key={key}>
                  <div
                    className={
                      active
                        ? "rounded-md bg-[#635BFF]/25 px-2 py-1.5 text-[10px] font-medium text-[#C4C0FF]"
                        : "rounded-md px-2 py-1.5 text-[10px] text-slate-400"
                    }
                  >
                    {t(`mock.nav.${key}`)}
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          {/* Main canvas */}
          <div className="space-y-3 p-3 sm:p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-white">
                {t("mock.today")}
              </p>
              <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[9px] font-medium text-emerald-300">
                {t("mock.live")}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  ["attendance", "96%"],
                  ["students", "248"],
                  ["invoices", "12"],
                ] as const
              ).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-2"
                >
                  <p className="text-[9px] text-slate-400">
                    {t(`mock.metrics.${key}`)}
                  </p>
                  <p className="mt-1 text-sm font-semibold tracking-tight text-white">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.03] p-2">
              <p className="mb-1.5 text-[9px] font-medium uppercase tracking-wider text-slate-500">
                {t("mock.attendanceTitle")}
              </p>
              <ul className="space-y-1">
                {(
                  [
                    ["Sara Benali", "present"],
                    ["Yanis M.", "late"],
                    ["Lina K.", "absent"],
                  ] as const
                ).map(([name, status]) => (
                  <li
                    key={name}
                    className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex size-5 items-center justify-center rounded-full bg-white/10 text-[8px] font-semibold text-slate-200">
                        {name.charAt(0)}
                      </span>
                      <span className="text-[10px] text-slate-200">{name}</span>
                    </div>
                    <span
                      className={
                        status === "present"
                          ? "text-[9px] font-medium text-emerald-400"
                          : status === "late"
                            ? "text-[9px] font-medium text-amber-300"
                            : "text-[9px] font-medium text-rose-300"
                      }
                    >
                      {t(`mock.status.${status}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex h-10 items-end gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2 pt-2 pb-1.5">
              {[45, 62, 55, 78, 70, 92, 84, 96].map((h, i) => (
                <span
                  key={i}
                  className={
                    i === 7
                      ? "flex-1 rounded-t-sm bg-linear-to-t from-[#635BFF] to-sky-400"
                      : "flex-1 rounded-t-sm bg-white/12"
                  }
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div
        aria-hidden
        className="absolute -bottom-6 -start-6 flex items-center gap-2.5 rounded-2xl border border-white/15 bg-slate-900/80 py-2 ps-2 pe-3.5 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl motion-safe:animate-[hero-float_6s_ease-in-out_infinite]"
      >
        <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-300">
          <Wallet className="size-4" aria-hidden />
        </span>
        <span>
          <span className="block text-[9px] text-slate-400">
            {t("mock.paymentLabel")}
          </span>
          <span className="block text-[11px] font-semibold text-white">
            {t("mock.paymentValue")}
          </span>
        </span>
        <span className="ms-1 rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-300">
          {t("mock.paid")}
        </span>
      </div>

      <div
        aria-hidden
        className="absolute -top-5 -end-5 flex items-center gap-2 rounded-2xl border border-white/15 bg-slate-900/80 py-1.5 ps-1.5 pe-3 shadow-[0_20px_40px_-16px_rgba(0,0,0,0.8)] backdrop-blur-xl motion-safe:animate-[hero-float_7s_ease-in-out_infinite]"
        style={{ animationDelay: "-2.5s" }}
      >
        <span className="relative flex size-7 items-center justify-center rounded-lg bg-[#635BFF]/25 text-[#C4C0FF]">
          <CheckCircle2 className="size-3.5" aria-hidden />
          <span className="absolute inset-0 rounded-lg ring-2 ring-[#635BFF]/40 motion-safe:animate-[pulse-ring_2.4s_ease-out_infinite]" />
        </span>
        <span className="text-[11px] font-semibold tabular-nums text-white">
          96%
          <span className="ms-1 font-normal text-slate-400">
            {t("mock.metrics.attendance")}
          </span>
        </span>
      </div>
    </div>
  );
}
