import type { MeMembership, MeResponse, OrganizationMe } from "@/lib/api/types";

export function pickActiveMembership(
  me: MeResponse,
  preferredOrganizationId?: string | null,
): MeMembership | null {
  const active = me.memberships.filter((m) => m.status === "ACTIVE");
  if (preferredOrganizationId) {
    const match = active.find((m) => m.organizationId === preferredOrganizationId);
    if (match) return match;
  }
  return active[0] ?? me.memberships[0] ?? null;
}

export function membershipDisplayName(me: MeResponse): string {
  const full = `${me.firstName} ${me.lastName}`.trim();
  return full || me.email;
}

export function applyTenantBranding(org: OrganizationMe | null): void {
  if (typeof document === "undefined") return;

  const config = org?.config ?? {};
  const accent =
    typeof config.accentColor === "string" ? config.accentColor : null;

  if (accent) {
    document.documentElement.style.setProperty("--tenant-accent", accent);
    document.documentElement.style.setProperty("--primary", accent);
    document.documentElement.style.setProperty("--sidebar-primary", accent);
    document.documentElement.style.setProperty("--ring", accent);
  } else {
    document.documentElement.style.removeProperty("--tenant-accent");
    document.documentElement.style.removeProperty("--primary");
    document.documentElement.style.removeProperty("--sidebar-primary");
    document.documentElement.style.removeProperty("--ring");
  }
}

export function orgLogoUrl(org: OrganizationMe | null): string | null {
  const logo = org?.config?.logoUrl;
  return typeof logo === "string" ? logo : null;
}
