"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";
import { useId, useState, type ComponentProps } from "react";

type PasswordFieldProps = Omit<ComponentProps<"input">, "type"> & {
  label?: string;
  error?: string;
  describedBy?: string;
  showLabel: string;
  hideLabel: string;
};

export function PasswordField({
  label,
  error,
  describedBy,
  showLabel,
  hideLabel,
  id,
  className,
  ...props
}: PasswordFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      {label ? (
        <Label htmlFor={fieldId} className="text-[13px]">
          {label}
        </Label>
      ) : null}
      <div className="relative">
        <Input
          id={fieldId}
          type={visible ? "text" : "password"}
          className={cn("pe-10", className)}
          aria-label={!label ? showLabel : undefined}
          aria-invalid={Boolean(error)}
          aria-describedby={
            [describedBy, error ? errorId : undefined].filter(Boolean).join(" ") ||
            undefined
          }
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute end-1 top-1/2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? hideLabel : showLabel}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="size-4" aria-hidden />
          ) : (
            <Eye className="size-4" aria-hidden />
          )}
        </Button>
      </div>
      {error && (
        <p id={errorId} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
