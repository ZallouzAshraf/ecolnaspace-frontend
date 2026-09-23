"use client";

import { DirectionProvider } from "@/components/ui/direction";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "sonner";
import type { ReactNode } from "react";

type AppProvidersProps = {
  children: ReactNode;
  direction: "ltr" | "rtl";
};

export function AppProviders({ children, direction }: AppProvidersProps) {
  return (
    <QueryProvider>
      <DirectionProvider dir={direction}>
        <TooltipProvider delayDuration={200}>
          <AuthProvider>
            {children}
            <Toaster
              position={direction === "rtl" ? "top-left" : "top-right"}
              richColors
              closeButton
            />
          </AuthProvider>
        </TooltipProvider>
      </DirectionProvider>
    </QueryProvider>
  );
}
