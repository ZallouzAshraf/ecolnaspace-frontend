"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { Menu, Bell, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

type AppTopBarProps = {
  onOpenMobileNav: () => void;
  onOpenCommandPalette?: () => void;
};

export function AppTopBar({
  onOpenMobileNav,
  onOpenCommandPalette,
}: AppTopBarProps) {
  const t = useTranslations();
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(next: AppLocale) {
    router.replace(pathname, { locale: next });
  }

  return (
    <header
      data-app-chrome
      className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-4"
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onOpenMobileNav}
        aria-label={t("nav.openMenu")}
      >
        <Menu className="size-4" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="hidden w-56 justify-start gap-2 text-muted-foreground sm:inline-flex md:w-64"
          onClick={onOpenCommandPalette}
        >
          <Search className="size-3.5" />
          <span className="truncate">{t("common.search")}</span>
          <kbd className="ms-auto hidden rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground md:inline">
            ⌘K
          </kbd>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {t(`locale.${locale}`)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("locale.label")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {locales.map((code) => (
              <DropdownMenuItem key={code} onSelect={() => switchLocale(code)}>
                {t(`locale.${code}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t("nav.notifications")}
        >
          <Bell className="size-4" />
        </Button>
      </div>
    </header>
  );
}
