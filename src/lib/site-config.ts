/**
 * Public company facts used by the marketing and legal pages.
 * `null` means "not confirmed yet": legal pages render a visible
 * "to be completed" marker instead of inventing a value.
 */
export const SITE = {
  name: "EcolnaSpace",
  appHost: "app.ecolnaspace.com",
  contactEmail: "contact@ecolnaspace.com",
  privacyEmail: "privacy@ecolnaspace.com",
  country: "TN",
  phone: null as string | null,
  city: null as string | null,
  legalEntity: null as string | null,
  registrationNumber: null as string | null,
  registeredAddress: null as string | null,
  hostingProvider: null as string | null,
  emailProvider: null as string | null,
  /** Days an establishment can export its data after the contract ends. */
  exportWindowDays: null as number | null,
  /** Days after the export window before production data is deleted. */
  deletionDays: null as number | null,
  /** Days before deleted data also disappears from backups. */
  backupRetentionDays: null as number | null,
  /** Months contact-form requests are kept when no contract follows. */
  contactRetentionMonths: null as number | null,
  legalLastUpdated: "2026-09-24",
  /** Flip to false once a Tunisian lawyer has reviewed the legal pages. */
  legalReviewPending: true,
} as const;

export type LegalToken =
  | "brand"
  | "contactEmail"
  | "privacyEmail"
  | "appHost"
  | "legalEntity"
  | "registrationNumber"
  | "registeredAddress"
  | "hostingProvider"
  | "emailProvider"
  | "exportWindowDays"
  | "deletionDays"
  | "backupRetentionDays"
  | "contactRetentionMonths";

export function legalTokenValue(token: LegalToken): string | null {
  switch (token) {
    case "brand":
      return SITE.name;
    case "contactEmail":
      return SITE.contactEmail;
    case "privacyEmail":
      return SITE.privacyEmail;
    case "appHost":
      return SITE.appHost;
    default: {
      const value = SITE[token];
      return value === null ? null : String(value);
    }
  }
}

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001").replace(
    /\/$/,
    "",
  );
}
