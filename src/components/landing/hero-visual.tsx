"use client";

import { ProductPreview } from "@/components/landing/product-preview";
import { cn } from "@/lib/utils";
import { CheckCircle2, Megaphone, Wallet } from "lucide-react";
import { useLocale } from "next-intl";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

type HeroVisualProps = {
  className?: string;
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
  chips?: {
    attendance: string;
    payment: string;
    paymentMeta: string;
    announce: string;
    announceMeta: string;
  };
};

/** Product UI mock with light CSS-3D depth — no photography. */
export function HeroVisual({ labels, chips, className }: HeroVisualProps) {
  const locale = useLocale();
  const rtl = locale === "ar";
  const stageRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const raf = useRef(0);
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    setReady(true);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const tick = () => {
      setTilt((prev) => {
        const nx = prev.x + (target.current.x - prev.x) * 0.08;
        const ny = prev.y + (target.current.y - prev.y) * 0.08;
        if (Math.abs(nx - prev.x) < 0.01 && Math.abs(ny - prev.y) < 0.01) {
          return prev;
        }
        return { x: nx, y: ny };
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [reduced]);

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (reduced || window.matchMedia("(pointer: coarse)").matches) return;
      const rect = stageRef.current?.getBoundingClientRect();
      if (!rect) return;
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      const dir = rtl ? -1 : 1;
      target.current = { x: py * -5, y: px * 7 * dir };
    },
    [reduced, rtl],
  );

  const onLeave = useCallback(() => {
    target.current = { x: 0, y: 0 };
  }, []);

  const baseY = rtl ? 5 : -5;
  const transform =
    reduced || !ready
      ? undefined
      : `rotateX(${3 + tilt.x}deg) rotateY(${baseY + tilt.y}deg)`;

  return (
    <div
      ref={stageRef}
      className={cn("relative isolate", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 -z-10 sm:-inset-10"
      >
        <div className="absolute start-1/4 top-0 size-64 rounded-full bg-[radial-gradient(circle,rgba(99,91,255,0.35),transparent_70%)] blur-3xl motion-safe:animate-[hero-orb_12s_ease-in-out_infinite]" />
        <div className="absolute end-0 bottom-0 size-56 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.3),transparent_70%)] blur-3xl motion-safe:animate-[hero-orb_14s_ease-in-out_infinite_reverse]" />
        <div className="absolute start-0 bottom-1/4 size-40 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.16),transparent_70%)] blur-3xl motion-safe:animate-[hero-orb_16s_ease-in-out_infinite]" />
      </div>

      <div
        className="relative [perspective:1400px]"
        style={{ perspectiveOrigin: rtl ? "70% 40%" : "30% 40%" }}
      >
        <div
          className={cn(
            !reduced &&
              ready &&
              "motion-safe:animate-[hero-float_7s_ease-in-out_infinite]",
          )}
        >
          <div
            className={cn(
              "relative will-change-transform [transform-style:preserve-3d]",
              !reduced && ready && "transition-transform duration-100 ease-out",
            )}
            style={
              {
                transform,
                transformStyle: "preserve-3d",
              } as CSSProperties
            }
          >
            <ProductPreview elevated labels={labels} />

            {chips ? (
              <>
                <FloatingChip
                  className="-top-5 end-2 sm:-end-6 lg:-end-10"
                  depth={60}
                  delay="0s"
                >
                  <span className="relative flex size-9 items-center justify-center rounded-xl bg-emerald-500/12 text-emerald-600">
                    <CheckCircle2 className="size-[18px]" strokeWidth={2} />
                    <span className="absolute inset-0 rounded-xl ring-2 ring-emerald-400/40 motion-safe:animate-[pulse-ring_2.4s_ease-out_infinite]" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] text-slate-500">
                      {chips.attendance}
                    </span>
                    <span className="block text-sm font-semibold tabular-nums text-slate-900">
                      238 / 248
                    </span>
                  </span>
                </FloatingChip>

                <FloatingChip
                  className="-bottom-6 -start-2 sm:-start-8 lg:-start-12"
                  depth={80}
                  delay="-3s"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/12 text-primary">
                    <Wallet className="size-[18px]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">
                      {chips.payment}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {chips.paymentMeta}
                    </span>
                  </span>
                </FloatingChip>

                <FloatingChip
                  className="bottom-16 -end-3 hidden sm:flex lg:-end-14"
                  depth={40}
                  delay="-1.5s"
                >
                  <span className="flex size-9 items-center justify-center rounded-xl bg-amber-500/12 text-amber-600">
                    <Megaphone className="size-[18px]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-900">
                      {chips.announce}
                    </span>
                    <span className="block text-[11px] text-slate-500">
                      {chips.announceMeta}
                    </span>
                  </span>
                </FloatingChip>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingChip({
  children,
  className,
  depth,
  delay,
}: {
  children: ReactNode;
  className?: string;
  depth: number;
  delay: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("absolute z-10 flex", className)}
      style={{ transform: `translateZ(${depth}px)` }}
    >
      <div
        className="flex items-center gap-2.5 rounded-2xl border border-white/80 bg-white/85 py-2 ps-2 pe-4 shadow-[0_20px_40px_-16px_rgba(30,27,75,0.35),inset_0_1px_0_rgba(255,255,255,0.9)] ring-1 ring-slate-900/5 backdrop-blur-xl motion-safe:animate-[hero-float_6s_ease-in-out_infinite]"
        style={{ animationDelay: delay }}
      >
        {children}
      </div>
    </div>
  );
}
