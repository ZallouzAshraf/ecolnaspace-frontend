"use client";

import { cn } from "@/lib/utils";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay in ms once visible */
  delay?: number;
  /** Subtle depth on enter */
  depth?: boolean;
};

export function Reveal({
  children,
  className,
  delay = 0,
  depth = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-700 motion-reduce:transition-none",
        visible
          ? "translate-y-0 translate-z-0 opacity-100"
          : cn(
              "translate-y-5 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100",
              depth && "scale-[0.98]",
            ),
        visible && depth && "scale-100",
        className,
      )}
      style={
        {
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          transitionDelay: visible && delay ? `${delay}ms` : undefined,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
