import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  ClipboardList,
  CreditCard,
  FileText,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  School,
  Users,
  UserCog,
  Wallet,
} from "lucide-react";

export type NavItem = {
  key: string;
  href: string;
  icon: LucideIcon;
  permissions?: string[];
  keywords?: string[];
};

export type NavSection = {
  key: string;
  items: NavItem[];
};

export const adminNavSections: NavSection[] = [
  {
    key: "main",
    items: [
      { key: "dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    key: "people",
    items: [
      {
        key: "students",
        href: "/students",
        icon: GraduationCap,
        permissions: ["students.read"],
      },
      {
        key: "parents",
        href: "/parents",
        icon: Users,
        permissions: ["parents.read"],
      },
      {
        key: "teachers",
        href: "/teachers",
        icon: BookOpen,
        permissions: ["teachers.read"],
      },
      {
        key: "staff",
        href: "/staff",
        icon: UserCog,
        permissions: ["staff.read"],
      },
      {
        key: "classes",
        href: "/classes",
        icon: School,
        permissions: ["classes.read", "classes.manage"],
      },
    ],
  },
  {
    key: "academic",
    items: [
      {
        key: "academicYears",
        href: "/academic/years",
        icon: CalendarDays,
        permissions: ["academic-years.read", "academic-years.manage"],
      },
      {
        key: "subjects",
        href: "/academic/subjects",
        icon: BookOpen,
        permissions: ["subjects.read", "subjects.manage"],
      },
      {
        key: "schedules",
        href: "/academic/schedules",
        icon: CalendarDays,
        permissions: ["classes.read", "classes.manage"],
      },
      {
        key: "homework",
        href: "/academic/homework",
        icon: FileText,
        permissions: ["homework.manage"],
      },
      {
        key: "exams",
        href: "/academic/exams",
        icon: ClipboardList,
        permissions: ["exams.manage"],
      },
      {
        key: "grades",
        href: "/academic/grades",
        icon: ClipboardList,
        permissions: ["grades.manage"],
      },
      {
        key: "attendance",
        href: "/attendance",
        icon: ClipboardList,
        permissions: ["attendance.read", "attendance.create"],
      },
    ],
  },
  {
    key: "finance",
    items: [
      {
        key: "invoices",
        href: "/finance/invoices",
        icon: Wallet,
        permissions: ["invoices.read"],
      },
      {
        key: "payments",
        href: "/finance/payments",
        icon: CreditCard,
        permissions: ["payments.create", "invoices.read"],
      },
    ],
  },
  {
    key: "communication",
    items: [
      {
        key: "announcements",
        href: "/communication/announcements",
        icon: Bell,
      },
      {
        key: "messages",
        href: "/communication/messages",
        icon: MessageSquare,
      },
      {
        key: "notifications",
        href: "/communication/notifications",
        icon: Bell,
      },
    ],
  },
  {
    key: "system",
    items: [
      {
        key: "campuses",
        href: "/organization/campuses",
        icon: Building2,
        permissions: ["campuses.read"],
      },
      {
        key: "users",
        href: "/organization/users",
        icon: Users,
        permissions: ["memberships.manage"],
      },
      {
        key: "documents",
        href: "/documents",
        icon: FolderOpen,
        permissions: ["documents.read"],
      },
    ],
  },
];

export function filterNavByPermissions(
  sections: NavSection[],
  permissions: string[],
  isSuperAdmin: boolean,
): NavSection[] {
  if (isSuperAdmin) return sections;

  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (!item.permissions?.length) return true;
        return item.permissions.some((p) => permissions.includes(p));
      }),
    }))
    .filter((section) => section.items.length > 0);
}

export function flattenNavItems(sections: NavSection[]): NavItem[] {
  return sections.flatMap((s) => s.items);
}
