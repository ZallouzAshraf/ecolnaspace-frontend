import { locales, type AppLocale } from "@/i18n/routing";

/** Strictly necessary: records the visitor's cookie choice itself. */
export const CONSENT_COOKIE = "ecolnaspace_consent";
/** Preference cookie: remembers the chosen language. Set only with consent. */
export const LOCALE_COOKIE = "ecolnaspace_locale";

/** Bump when a new non-essential category is introduced so everyone is asked again. */
const CONSENT_VERSION = 1;
const CONSENT_MAX_AGE = 60 * 60 * 24 * 180;
const LOCALE_MAX_AGE = 60 * 60 * 24 * 365;

const CHANGE_EVENT = "ecolnaspace:consent-change";
const OPEN_EVENT = "ecolnaspace:consent-open";

export type ConsentChoice = { preferences: boolean };

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

/** Raw cookie value; stable string so it can back useSyncExternalStore. */
export function readConsentRaw(): string {
  return readCookie(CONSENT_COOKIE) ?? "";
}

export function parseConsent(raw: string | null | undefined): ConsentChoice | null {
  if (!raw) return null;
  const [version, prefs] = raw.split(".");
  if (version !== `v${CONSENT_VERSION}`) return null;
  if (prefs !== "p1" && prefs !== "p0") return null;
  return { preferences: prefs === "p1" };
}

export function saveConsent(choice: ConsentChoice): void {
  const value = `v${CONSENT_VERSION}.${choice.preferences ? "p1" : "p0"}`;
  document.cookie = `${CONSENT_COOKIE}=${value}; Path=/; Max-Age=${CONSENT_MAX_AGE}; SameSite=Lax`;
  if (!choice.preferences) {
    document.cookie = `${LOCALE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

export function openConsentPreferences(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onConsentPreferencesRequested(handler: () => void): () => void {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}

/** Persists the language choice only when preference cookies are allowed. */
export function rememberLocale(locale: AppLocale): void {
  if (!parseConsent(readConsentRaw())?.preferences) return;
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_MAX_AGE}; SameSite=Lax`;
}

export function isAppLocale(value: string | undefined): value is AppLocale {
  return Boolean(value && (locales as readonly string[]).includes(value));
}
