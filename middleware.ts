import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_HINT_COOKIE } from "./src/lib/auth/constants";
import { isAppLocale, LOCALE_COOKIE } from "./src/lib/consent";
import { routing } from "./src/i18n/routing";

const handleI18n = createMiddleware(routing);

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

const PUBLIC_MARKETING_PATHS = new Set([
  "/pricing",
  "/contact",
  "/privacy",
  "/terms",
  "/cookies",
]);

function hasLocalePrefix(pathname: string): boolean {
  const first = pathname.split("/").filter(Boolean)[0];
  return isAppLocale(first);
}

function stripLocale(pathname: string): { locale: string; path: string } {
  const segments = pathname.split("/").filter(Boolean);
  const maybeLocale = segments[0];
  if (
    maybeLocale &&
    routing.locales.includes(maybeLocale as (typeof routing.locales)[number])
  ) {
    const path = "/" + segments.slice(1).join("/");
    return { locale: maybeLocale, path: path === "/" ? "/" : path };
  }
  return { locale: routing.defaultLocale, path: pathname || "/" };
}

export default function middleware(request: NextRequest) {
  // Only set when the visitor accepted preference cookies.
  const rememberedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!hasLocalePrefix(request.nextUrl.pathname) && isAppLocale(rememberedLocale)) {
    const url = request.nextUrl.clone();
    url.pathname = `/${rememberedLocale}${request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname}`;
    return NextResponse.redirect(url);
  }

  const { locale, path } = stripLocale(request.nextUrl.pathname);
  const hasSessionHint =
    request.cookies.get(SESSION_HINT_COOKIE)?.value === "1";
  const isAuthPath = AUTH_PATHS.has(path === "/" ? "/" : path);

  // Soft gate only — real auth is enforced client-side + API.
  if (!isAuthPath && path !== "/" && !hasSessionHint) {
    const isPublicMarketing = PUBLIC_MARKETING_PATHS.has(path);

    // Allow public root + marketing/legal through i18n; app pages need session hint
    const isAppPath =
      !isPublicMarketing &&
      (path.startsWith("/dashboard") ||
        path.startsWith("/students") ||
        path.startsWith("/parents") ||
        path.startsWith("/teachers") ||
        path.startsWith("/staff") ||
        path.startsWith("/classes") ||
        path.startsWith("/attendance") ||
        path.startsWith("/academic") ||
        path.startsWith("/finance") ||
        path.startsWith("/communication") ||
        path.startsWith("/daycare") ||
        path.startsWith("/documents") ||
        path.startsWith("/organization") ||
        path.startsWith("/settings"));

    if (isAppPath) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      url.searchParams.set("next", `${path}${request.nextUrl.search}`);
      return NextResponse.redirect(url);
    }
  }

  if (
    hasSessionHint &&
    (path === "/" || path === "/login" || path === "/register")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/dashboard`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return handleI18n(request);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
