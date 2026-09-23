"use client";

import { authApi } from "@/lib/api/auth";
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
  error: Error | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: sessionQueryKey,
    queryFn: () => authApi.bootstrap(),
    retry: false,
    staleTime: 60_000,
  });

  const membership = useMemo(
    () => (sessionQuery.data ? pickActiveMembership(sessionQuery.data) : null),
    [sessionQuery.data],
  );

  const orgQuery = useQuery({
    queryKey: organizationQueryKey,
    queryFn: () => organizationsApi.me(),
    enabled: Boolean(membership),
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
    await authApi.logout();
    applyTenantBranding(null);
    queryClient.clear();
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(() => {
    const me = sessionQuery.data ?? null;
    const isAuthenticated = Boolean(me);
    const permissions = membership?.permissions ?? [];

    return {
      me,
      membership,
      organization: orgQuery.data ?? null,
      organizationLogo: orgLogoUrl(orgQuery.data ?? null),
      displayName: me ? membershipDisplayName(me) : "",
      permissions,
      isSuperAdmin: me?.isSuperAdmin ?? false,
      isLoading: sessionQuery.isPending,
      isAuthenticated,
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
