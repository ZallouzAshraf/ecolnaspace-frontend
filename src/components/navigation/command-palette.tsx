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
import { Building2, GraduationCap, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState, type ComponentType } from "react";

type CommandPaletteProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

function ItemIcon({ icon: Icon }: { icon: ComponentType<{ className?: string }> }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 group-data-selected/command-item:bg-white group-data-selected/command-item:text-slate-600">
      <Icon className="size-4" />
    </span>
  );
}

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
                value={`${item.key} ${item.href} ${t(`nav.${item.key}`)}`}
                onSelect={() => go(item.href)}
              >
                <ItemIcon icon={Icon} />
                <span className="truncate">{t(`nav.${item.key}`)}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading={t("command.actions")}>
          <CommandItem
            value={`add student ${t("command.addStudent")}`}
            onSelect={() => go("/students")}
          >
            <ItemIcon icon={GraduationCap} />
            <span className="truncate">{t("command.addStudent")}</span>
          </CommandItem>
          <CommandItem
            value={`invite teacher ${t("command.inviteTeacher")}`}
            onSelect={() => go("/teachers")}
          >
            <ItemIcon icon={UserPlus} />
            <span className="truncate">{t("command.inviteTeacher")}</span>
          </CommandItem>
          <CommandItem
            value={`create campus ${t("command.createCampus")}`}
            onSelect={() => go("/organization/campuses")}
          >
            <ItemIcon icon={Building2} />
            <span className="truncate">{t("command.createCampus")}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
