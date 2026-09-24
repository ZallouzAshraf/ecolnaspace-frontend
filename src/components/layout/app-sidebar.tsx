"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import {
  ChevronLeft,
  ChevronRight,
  Languages,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { useLocale } from "next-intl";
import { isRtlLocale, locales, type AppLocale } from "@/i18n/routing";
import {
  adminNavSections,
  filterNavByPermissions,
  type NavSection,
} from "@/components/navigation/nav-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

type AppSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  permissions?: string[];
  isSuperAdmin?: boolean;
  organizationName?: string;
  organizationLogo?: string | null;
  userName?: string;
  userEmail?: string;
  onLogout?: () => Promise<void>;
};

export function AppSidebar({
  collapsed,
  onCollapsedChange,
  permissions = [],
  isSuperAdmin = false,
  organizationName,
  organizationLogo,
  userName,
  userEmail,
  onLogout,
}: AppSidebarProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const tAuth = useTranslations("auth");
  const tLocale = useTranslations("locale");
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const rtl = isRtlLocale(locale);
  const CollapseIcon = collapsed
    ? rtl
      ? ChevronLeft
      : PanelLeftOpen
    : rtl
      ? ChevronRight
      : PanelLeftClose;

  const sections: NavSection[] = filterNavByPermissions(
    adminNavSections,
    permissions,
    isSuperAdmin,
  );

  const displayName = userName || userEmail || tCommon("appName");
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  function switchLocale(next: AppLocale) {
    router.replace(pathname, { locale: next });
  }

  async function handleLogout() {
    if (onLogout) {
      await onLogout();
    }
  }

  return (
    <aside
      data-app-chrome
      className={cn(
        "flex h-full min-h-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-18" : "w-60",
      )}
    >
      <div
        className={cn(
          "flex shrink-0 items-center border-b border-sidebar-border",
          collapsed ? "h-16 justify-center px-3" : "min-h-16 gap-3 px-4 py-3.5",
        )}
      >
        {organizationLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={organizationLogo}
            alt=""
            className="size-9 shrink-0 rounded-xl object-cover ring-1 ring-black/5"
          />
        ) : (
          <span
            aria-hidden
            className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-[#7c73ff] via-primary to-[#3b82f6] shadow-[0_6px_16px_-6px_rgba(99,91,255,0.7),inset_0_1px_0_rgba(255,255,255,0.35)]"
          >
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_55%)]" />
            <svg
              viewBox="0 0 24 24"
              className="relative size-[18px] text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16.5 6.5H9a3 3 0 0 0-3 3v5a3 3 0 0 0 3 3h7.5" />
              <path d="M6.5 12h7" />
            </svg>
          </span>
        )}
        {!collapsed && (
          <div className="min-w-0 flex-1 pe-1">
            <p className="truncate text-[0.95rem] font-semibold leading-snug tracking-tight text-sidebar-foreground">
              {organizationName ?? tCommon("appName")}
            </p>
            {organizationName ? (
              <p className="mt-0.5 truncate text-xs leading-snug text-muted-foreground">
                {tCommon("appName")}
              </p>
            ) : (
              <p className="mt-0.5 truncate text-xs leading-snug text-muted-foreground">
                {isSuperAdmin ? tCommon("superAdmin") : tCommon("appName")}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-3">
        <nav className="flex flex-col gap-4" aria-label="Main">
          {sections.map((section, index) => (
            <div key={section.key} className="flex flex-col gap-1">
              {index > 0 && <Separator className="mb-2" />}
              {section.items.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    title={collapsed ? t(item.key) : undefined}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent font-medium text-sidebar-primary"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {!collapsed && (
                      <span className="truncate">{t(item.key)}</span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      <div className="shrink-0 space-y-1 border-t border-sidebar-border p-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className={cn(
                "h-auto w-full cursor-pointer rounded-xl border border-primary/20 bg-[#7c73ff]/14 px-2 py-2 text-sidebar-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]",
                "hover:bg-[#7c73ff]/20 hover:text-sidebar-foreground",
                "aria-expanded:bg-[#7c73ff]/20 aria-expanded:text-sidebar-foreground",
                collapsed ? "justify-center" : "justify-start gap-3",
              )}
              aria-label={t("accountMenu")}
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#7c73ff]/20 via-primary/15 to-[#3b82f6]/20 text-xs font-semibold tracking-wide text-primary ring-1 ring-primary/15">
                {initials || "U"}
              </span>
              {!collapsed && (
                <span className="min-w-0 flex-1 text-start">
                  <span className="block truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
                    {displayName}
                  </span>
                  {userEmail && userName ? (
                    <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                      {userEmail}
                    </span>
                  ) : null}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align={collapsed ? "center" : "start"}
            sideOffset={10}
            className="w-64 min-w-64 overflow-hidden rounded-2xl border-0 bg-white/95 p-1.5 shadow-[0_24px_48px_-20px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/80 backdrop-blur-md"
          >
            <DropdownMenuLabel className="rounded-xl bg-slate-50/90 px-3 py-3 font-normal">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#7c73ff] via-primary to-[#3b82f6] text-xs font-semibold text-white shadow-[0_8px_18px_-8px_rgba(99,91,255,0.8)]">
                  {initials || "U"}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold tracking-tight text-slate-950">
                    {userName ?? userEmail ?? tCommon("appName")}
                  </span>
                  {userEmail ? (
                    <span className="mt-0.5 block truncate text-xs text-slate-500">
                      {userEmail}
                    </span>
                  ) : null}
                  {isSuperAdmin ? (
                    <span className="mt-1 inline-flex rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      {tCommon("superAdmin")}
                    </span>
                  ) : null}
                </span>
              </div>
            </DropdownMenuLabel>

            <div className="mt-1.5 space-y-0.5 px-0.5">
              <DropdownMenuItem
                className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium"
                onSelect={() => {
                  router.push("/settings");
                }}
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Settings className="size-3.5" aria-hidden />
                </span>
                {t("settings")}
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="mx-1 my-1.5 bg-slate-100" />

            <div className="px-2 py-1.5">
              <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-medium tracking-wide text-slate-400 uppercase">
                <Languages className="size-2.5" aria-hidden />
                {tLocale("label")}
              </p>
              <div
                role="group"
                aria-label={tLocale("label")}
                className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100/90 p-1"
              >
                {locales.map((code) => {
                  const active = code === locale;
                  return (
                    <button
                      key={code}
                      type="button"
                      onClick={() => switchLocale(code)}
                      className={cn(
                        "rounded-lg px-2 py-1.5 text-[11px] font-semibold tracking-wide transition-all",
                        active
                          ? "bg-white text-primary shadow-sm ring-1 ring-black/5"
                          : "text-slate-500 hover:bg-white/60 hover:text-slate-700",
                      )}
                      aria-pressed={active}
                    >
                      {code.toUpperCase()}
                    </button>
                  );
                })}
              </div>
            </div>

            <DropdownMenuSeparator className="mx-1 my-1.5 bg-slate-100" />

            <div className="px-0.5 pb-0.5">
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer gap-2.5 rounded-xl px-2.5 py-2.5 text-[13px] font-medium"
                onSelect={() => {
                  void handleLogout();
                }}
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <LogOut className="size-3.5" aria-hidden />
                </span>
                {tAuth("logout")}
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn(
            "w-full text-muted-foreground",
            !collapsed && "justify-start",
          )}
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? t("expandSidebar") : t("collapseSidebar")}
        >
          <CollapseIcon className="size-4" />
          {!collapsed && (
            <span className="ms-2">
              {collapsed ? t("expandSidebar") : t("collapseSidebar")}
            </span>
          )}
        </Button>
      </div>
    </aside>
  );
}
