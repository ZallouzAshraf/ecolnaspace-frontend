import { ApiError, type ApiErrorBody, type RefreshResponse } from "./types";
import { clearSession, getAccessToken, setAccessToken } from "./token";

const DEFAULT_API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api/v1";

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  headers?: HeadersInit;
  /** Skip Authorization header */
  public?: boolean;
  /** Avoid infinite refresh loops */
  skipRefresh?: boolean;
  /** Active UI locale — forwarded for backend localization */
  locale?: string;
  signal?: AbortSignal;
};

let refreshPromise: Promise<string | null> | null = null;
/** Bumped on logout so in-flight refresh cannot restore the session. */
let refreshEpoch = 0;

const REFRESH_LOCK = "ecolna-auth-refresh";

/** Cancel coalesced refresh and ignore any result still in flight. */
export function abortAuthRefresh(): void {
  refreshEpoch += 1;
  refreshPromise = null;
}

function getLocaleHint(explicit?: string): string | undefined {
  if (explicit) return explicit;
  if (typeof document !== "undefined") {
    return document.documentElement.lang || undefined;
  }
  return undefined;
}

async function parseError(response: Response): Promise<ApiError> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return new ApiError({
      statusCode: body.statusCode ?? response.status,
      message: body.message ?? response.statusText,
      error: body.error ?? "Error",
      requestId: body.requestId,
    });
  } catch {
    return new ApiError({
      statusCode: response.status,
      message: response.statusText || "Request failed",
      error: "Error",
    });
  }
}

async function refreshOnce(): Promise<string | null> {
  const epoch = refreshEpoch;
  const response = await fetch(`${DEFAULT_API_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  if (epoch !== refreshEpoch) {
    return null;
  }

  if (!response.ok) {
    clearSession();
    return null;
  }

  const data = (await response.json()) as RefreshResponse;
  if (epoch !== refreshEpoch) {
    return null;
  }

  setAccessToken(data.accessToken);
  return data.accessToken;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    const run = async (): Promise<string | null> => {
      if (typeof navigator !== "undefined" && navigator.locks?.request) {
        const locked = await navigator.locks.request(REFRESH_LOCK, () =>
          refreshOnce(),
        );
        return await locked;
      }
      return refreshOnce();
    };

    refreshPromise = run().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

const LOCALES = ["fr", "en", "ar"] as const;

/** Locale-stripped app path for next-intl navigation (never `/fr/dashboard`). */
export function localeStrippedPath(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  if (first && (LOCALES as readonly string[]).includes(first)) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  const localeSegment = window.location.pathname.split("/")[1] || "fr";
  const returnTo = encodeURIComponent(
    localeStrippedPath(window.location.pathname) + window.location.search,
  );
  // Full navigation clears client state after session loss.
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- intentional hard redirect
  window.location.assign(
    `/${localeSegment}/login?next=${returnTo}&reason=session`,
  );
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    headers: customHeaders,
    public: isPublic = false,
    skipRefresh = false,
    locale,
    signal,
  } = options;

  const headers = new Headers(customHeaders);
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  if (body !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const localeHint = getLocaleHint(locale);
  if (localeHint) {
    headers.set("Accept-Language", localeHint);
  }

  if (!isPublic) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = resolveApiUrl(path);

  const response = await fetch(url, {
    method,
    headers,
    credentials: "include",
    signal,
    body:
      body === undefined
        ? undefined
        : isFormData
          ? (body as FormData)
          : JSON.stringify(body),
  });

  if (response.status === 401 && !isPublic && !skipRefresh) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return apiClient<T>(path, { ...options, skipRefresh: true });
    }
    redirectToLogin();
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function resolveApiUrl(path: string): string {
  return path.startsWith("http")
    ? path
    : `${DEFAULT_API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Authenticated binary download (blob), with refresh retry. */
export async function downloadAuthenticatedBlob(
  path: string,
  options: { filename?: string; locale?: string; skipRefresh?: boolean } = {},
): Promise<void> {
  const { filename, locale, skipRefresh = false } = options;
  const headers = new Headers();
  const localeHint = getLocaleHint(locale);
  if (localeHint) {
    headers.set("Accept-Language", localeHint);
  }
  const token = getAccessToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(resolveApiUrl(path), {
    method: "GET",
    headers,
    credentials: "include",
  });

  if (response.status === 401 && !skipRefresh) {
    const nextToken = await refreshAccessToken();
    if (nextToken) {
      return downloadAuthenticatedBlob(path, {
        ...options,
        skipRefresh: true,
      });
    }
    redirectToLogin();
    throw new ApiError({
      statusCode: 401,
      message: "Unauthorized",
      error: "Unauthorized",
    });
  }

  if (!response.ok) {
    throw await parseError(response);
  }

  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition");
  const matched = disposition?.match(/filename="?([^";]+)"?/i);
  const resolvedName = filename ?? matched?.[1] ?? "download";

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = resolvedName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}
