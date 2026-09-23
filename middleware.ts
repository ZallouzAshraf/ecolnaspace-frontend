import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_HINT_COOKIE } from "./src/lib/auth/constants";
import { routing } from "./src/i18n/routing";

const handleI18n = createMiddleware(routing);

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
]);

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
  const { locale, path } = stripLocale(request.nextUrl.pathname);
  const hasSessionHint =
    request.cookies.get(SESSION_HINT_COOKIE)?.value === "1";
  const isAuthPath = AUTH_PATHS.has(path === "/" ? "/" : path);

  // Soft gate only — real auth is enforced client-side + API.
  if (!isAuthPath && path !== "/" && !hasSessionHint) {
    const isPublicMarketing =
      path === "/privacy" || path === "/terms";

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
      url.searchParams.set("next", request.nextUrl.pathname);
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
