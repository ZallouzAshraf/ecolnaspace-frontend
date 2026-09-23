"use client";

import { AppShell } from "@/components/layout/app-shell";
import { CommandPalette } from "@/components/navigation/command-palette";
import { AuthGate } from "@/components/providers/auth-gate";
import { useAuth } from "@/components/providers/auth-provider";
import { useState, type ReactNode } from "react";

function AuthenticatedShell({ children }: { children: ReactNode }) {
  const {
    me,
    displayName,
    permissions,
    isSuperAdmin,
    organization,
    organizationLogo,
    membership,
    logout,
  } = useAuth();
  const [commandOpen, setCommandOpen] = useState(false);

  return (
    <>
      <AppShell
        userEmail={me?.email}
        userName={displayName}
        permissions={permissions}
        isSuperAdmin={isSuperAdmin}
        organizationName={organization?.name ?? membership?.organization.name}
        organizationLogo={organizationLogo}
        onLogout={logout}
        onOpenCommandPalette={() => setCommandOpen(true)}
      >
        {children}
      </AppShell>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  );
}

export function AppLayoutClient({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <AuthenticatedShell>{children}</AuthenticatedShell>
    </AuthGate>
  );
}
