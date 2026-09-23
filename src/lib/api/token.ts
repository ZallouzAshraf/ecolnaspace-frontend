import { SESSION_HINT_COOKIE } from "@/lib/auth/constants";

const ACCESS_TOKEN_KEY = "ecolnaspace_access_token";

let memoryToken: string | null = null;

function setSessionHintCookie(active: boolean): void {
  if (typeof document === "undefined") return;
  if (active) {
    document.cookie = `${SESSION_HINT_COOKIE}=1; Path=/; SameSite=Lax; Max-Age=604800`;
  } else {
    document.cookie = `${SESSION_HINT_COOKIE}=; Path=/; Max-Age=0`;
  }
}

export function getAccessToken(): string | null {
  if (memoryToken) return memoryToken;
  if (typeof window === "undefined") return null;
  memoryToken = sessionStorage.getItem(ACCESS_TOKEN_KEY);
  return memoryToken;
}

export function setAccessToken(token: string | null): void {
  memoryToken = token;
  if (typeof window === "undefined") return;
  if (token) {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    setSessionHintCookie(true);
  } else {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    setSessionHintCookie(false);
  }
}

export function clearSession(): void {
  setAccessToken(null);
  if (typeof document !== "undefined") {
    document.documentElement.style.removeProperty("--tenant-accent");
    document.documentElement.style.removeProperty("--primary");
    document.documentElement.style.removeProperty("--sidebar-primary");
    document.documentElement.style.removeProperty("--ring");
  }
}
