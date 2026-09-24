"use client";

import { authApi } from "@/lib/api/auth";
import { abortAuthRefresh } from "@/lib/api/client";
import { organizationsApi } from "@/lib/api/resources";
import { clearSession } from "@/lib/api/token";
import type { MeMembership, MeResponse, OrganizationMe } from "@/lib/api/types";
import {
  applyTenantBranding,
  membershipDisplayName,
  orgLogoUrl,
  pickActiveMembership,
} from "@/lib/auth/session-utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const sessionQueryKey = ["auth", "me"] as const;
export const organizationQueryKey = ["organizations", "me"] as const;

type AuthContextValue = {
  me: MeResponse | null;
  membership: MeMembership | null;
  organization: OrganizationMe | null;
  organizationLogo: string | null;
  displayName: string;
  permissions: string[];
  isSuperAdmin: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoggingOut: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function hardRedirectToLogin(): void {
  if (typeof window === "undefined") return;
  const localeSegment = window.location.pathname.split("/")[1] || "fr";
  // Full reload clears gate races and in-flight React Query observers.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard redirect
  window.location.assign(`/${localeSegment}/login`);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const sessionQuery = useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => authApi.bootstrap(),
    enabled: !isLoggingOut,
    retry: false,
    staleTime: 60_000,
  });

  const membership = useMemo(
    () => (sessionQuery.data ? pickActiveMembership(sessionQuery.data) : null),
    [sessionQuery.data],
  );

  const isSuperAdmin = sessionQuery.data?.isSuperAdmin ?? false;
  const hasTenantContext = Boolean(membership) || isSuperAdmin;

  const orgQuery = useQuery({
    queryKey: organizationQueryKey,
    queryFn: () => organizationsApi.me(),
    enabled: hasTenantContext && !isLoggingOut,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    applyTenantBranding(orgQuery.data ?? null);
  }, [orgQuery.data]);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: sessionQueryKey });
    await queryClient.invalidateQueries({ queryKey: organizationQueryKey });
  }, [queryClient]);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    abortAuthRefresh();
    try {
      await authApi.logout();
    } finally {
      applyTenantBranding(null);
      queryClient.removeQueries({ queryKey: sessionQueryKey });
      queryClient.removeQueries({ queryKey: organizationQueryKey });
      hardRedirectToLogin();
    }
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const me = sessionQuery.data ?? null;
    const isAuthenticated = Boolean(me);
    const permissions =
      membership?.permissions ??
      (me?.isSuperAdmin
        ? Array.from(
            new Set(
              (me.memberships ?? []).flatMap((entry) => entry.permissions),
            ),
          )
        : []);

    return {
      me,
      membership,
      organization: orgQuery.data ?? null,
      organizationLogo: orgLogoUrl(orgQuery.data ?? null),
      displayName: me ? membershipDisplayName(me) : "",
      permissions,
      isSuperAdmin: me?.isSuperAdmin ?? false,
      isLoading: sessionQuery.isPending && !isLoggingOut,
      isAuthenticated,
      isLoggingOut,
      error: sessionQuery.error instanceof Error ? sessionQuery.error : null,
      refresh,
      logout,
    };
  }, [
    sessionQuery.data,
    sessionQuery.isPending,
    sessionQuery.error,
    membership,
    orgQuery.data,
    isLoggingOut,
    refresh,
    logout,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

export function useOptionalAuth(): AuthContextValue | null {
  return useContext(AuthContext);
}

/** Clear failed bootstrap so login can start fresh without stale errors. */
export function resetAuthQueries(queryClient: ReturnType<typeof useQueryClient>) {
  clearSession();
  queryClient.removeQueries({ queryKey: sessionQueryKey });
  queryClient.removeQueries({ queryKey: organizationQueryKey });
}
