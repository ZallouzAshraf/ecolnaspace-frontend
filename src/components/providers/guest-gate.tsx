"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/navigation";
import { useEffect, type ReactNode } from "react";

/**
 * Redirect authenticated users away from login/register.
 * Always keeps children mounted after the cold check so a successful
 * login does not blank the form while navigation is in flight.
 */
export function GuestGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, isLoggingOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggingOut) return;
    if (!isLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, isLoggingOut, router]);

  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex w-full flex-col gap-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return children;
}
