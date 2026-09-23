"use client";

import { cn } from "@/lib/utils";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
};

/** Subtle 3D tilt on hover — disabled for reduced-motion / coarse pointers. */
export function TiltCard({ children, className }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [style, setStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    setEnabled(!reduced && !coarse);
  }, []);

  const onMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!enabled) return;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      setStyle({
        transform: `perspective(800px) rotateX(${py * -6}deg) rotateY(${px * 8}deg) translateY(-2px)`,
        transition: "transform 80ms ease-out",
      });
    },
    [enabled],
  );

  const onLeave = useCallback(() => {
    setStyle({
      transform: "perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0)",
      transition: "transform 400ms cubic-bezier(0.22, 1, 0.36, 1)",
    });
  }, []);

  return (
    <div
      ref={ref}
      className={cn("h-full will-change-transform", className)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={enabled ? style : undefined}
    >
      {children}
    </div>
  );
}
