"use client";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopBar } from "@/components/layout/app-top-bar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { isRtlLocale } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useState, type ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  userEmail?: string;
  userName?: string;
  permissions?: string[];
  isSuperAdmin?: boolean;
  organizationName?: string;
  organizationLogo?: string | null;
  onLogout?: () => Promise<void>;
  onOpenCommandPalette?: () => void;
};

export function AppShell({
  children,
  userEmail,
  userName,
  permissions,
  isSuperAdmin,
  organizationName,
  organizationLogo,
  onLogout,
  onOpenCommandPalette,
}: AppShellProps) {
  const t = useTranslations("common");
  const locale = useLocale();
  const rtl = isRtlLocale(locale);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-svh overflow-hidden bg-background">
      <div className="hidden h-full min-h-0 lg:flex">
        <AppSidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          permissions={permissions}
          isSuperAdmin={isSuperAdmin}
          organizationName={organizationName}
          organizationLogo={organizationLogo}
          userName={userName}
          userEmail={userEmail}
          onLogout={onLogout}
        />
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side={rtl ? "right" : "left"}
          showCloseButton={false}
          className="h-full w-60 max-w-60 gap-0 p-0 data-[side=left]:w-60 data-[side=right]:w-60 sm:max-w-60"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{t("appName")}</SheetTitle>
          </SheetHeader>
          <AppSidebar
            collapsed={false}
            onCollapsedChange={() => setMobileOpen(false)}
            permissions={permissions}
            isSuperAdmin={isSuperAdmin}
            organizationName={organizationName}
            organizationLogo={organizationLogo}
            userName={userName}
            userEmail={userEmail}
            onLogout={onLogout}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopBar
          onOpenMobileNav={() => setMobileOpen(true)}
          onOpenCommandPalette={onOpenCommandPalette}
        />
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
