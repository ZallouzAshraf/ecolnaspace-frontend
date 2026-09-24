"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, type ReactNode } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, error, isLoggingOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoggingOut || isLoading) return;
    if (!isAuthenticated || error) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, isLoading, isLoggingOut, error, router, pathname]);

  if (isLoggingOut) {
    return children;
  }

  if (isLoading) {
    return (
      <div className="flex h-svh flex-col gap-4 p-6">
        <Skeleton className="h-10 w-48" />
        <div className="flex flex-1 gap-4">
          <Skeleton className="hidden w-60 lg:block" />
          <div className="flex flex-1 flex-col gap-3">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
