import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type FormFieldProps = {
  label?: ReactNode;
  htmlFor?: string;
  error?: string;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
};

/** Owns label → control (6–8px) spacing. Stack siblings with FormStack. */
export function FormField({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label ? (
        <Label htmlFor={htmlFor} className="text-[13px] font-medium">
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

type FormStackProps = {
  className?: string;
  children: ReactNode;
};

/** Field-to-field spacing (16px). Put submit outside or after with mt-6. */
export function FormStack({ className, children }: FormStackProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>{children}</div>
  );
}
