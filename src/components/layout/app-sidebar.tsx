"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useLocale } from "next-intl";
import { isRtlLocale } from "@/i18n/routing";
import {
  adminNavSections,
  filterNavByPermissions,
  type NavSection,
} from "@/components/navigation/nav-config";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

type AppSidebarProps = {
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  permissions?: string[];
  isSuperAdmin?: boolean;
  organizationName?: string;
  organizationLogo?: string | null;
};

export function AppSidebar({
  collapsed,
  onCollapsedChange,
  permissions = [],
  isSuperAdmin = false,
  organizationName,
  organizationLogo,
}: AppSidebarProps) {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const locale = useLocale();
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

  return (
    <aside
      data-app-chrome
      className={cn(
        "flex h-full flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-[72px]" : "w-60",
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        {organizationLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={organizationLogo}
            alt=""
            className="size-8 rounded-lg object-cover"
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            E
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold tracking-tight">
              {organizationName ?? tCommon("appName")}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {tCommon("appName")}
            </p>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
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
                    {!collapsed && <span className="truncate">{t(item.key)}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-2">
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn("w-full", !collapsed && "justify-start")}
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
