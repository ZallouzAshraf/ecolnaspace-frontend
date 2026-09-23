"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  adminNavSections,
  filterNavByPermissions,
  flattenNavItems,
} from "@/components/navigation/nav-config";
import { useAuth } from "@/components/providers/auth-provider";
import { useRouter } from "@/i18n/navigation";
import { GraduationCap, UserPlus, Building2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

type CommandPaletteProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CommandPalette({
  open: controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = onOpenChange ?? setUncontrolledOpen;

  const t = useTranslations();
  const router = useRouter();
  const { permissions, isSuperAdmin } = useAuth();

  const navItems = useMemo(() => {
    const sections = filterNavByPermissions(
      adminNavSections,
      permissions,
      isSuperAdmin,
    );
    return flattenNavItems(sections);
  }, [permissions, isSuperAdmin]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(!open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t("command.title")}
      description={t("command.description")}
    >
      <CommandInput placeholder={t("command.placeholder")} />
      <CommandList>
        <CommandEmpty>{t("common.noResults")}</CommandEmpty>
        <CommandGroup heading={t("command.navigation")}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={`${item.key} ${item.href}`}
                onSelect={() => go(item.href)}
              >
                <Icon className="size-4" />
                {t(`nav.${item.key}`)}
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t("command.actions")}>
          <CommandItem
            value="add student"
            onSelect={() => go("/students")}
          >
            <GraduationCap className="size-4" />
            {t("command.addStudent")}
          </CommandItem>
          <CommandItem
            value="invite teacher"
            onSelect={() => go("/teachers")}
          >
            <UserPlus className="size-4" />
            {t("command.inviteTeacher")}
          </CommandItem>
          <CommandItem
            value="create campus"
            onSelect={() => go("/organization/campuses")}
          >
            <Building2 className="size-4" />
            {t("command.createCampus")}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
