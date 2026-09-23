import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
  label?: string;
  tone?: "light" | "dark";
};

export function BrandMark({ className, label, tone = "light" }: BrandMarkProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="relative flex size-8 items-center justify-center overflow-hidden rounded-[10px] bg-linear-to-br from-[#7c73ff] via-primary to-[#3b82f6] shadow-[0_6px_16px_-6px_rgba(99,91,255,0.7),inset_0_1px_0_rgba(255,255,255,0.35)]"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_55%)]" />
        <svg
          viewBox="0 0 24 24"
          className="relative size-[18px] text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16.5 6.5H9a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h7.5" />
          <path d="M6.5 12h7" />
        </svg>
      </span>
      {label ? (
        <span
          className={cn(
            "text-[1.05rem] font-semibold tracking-tight",
            tone === "dark" ? "text-white" : "text-foreground",
          )}
        >
          {label}
        </span>
      ) : null}
    </span>
  );
}
