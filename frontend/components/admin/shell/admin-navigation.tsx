import type { ReactNode } from "react";
import {
  BarChart3,
  FileText,
  History,
  LayoutGrid,
  ListChecks,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  PERMISSIONS,
  type PermissionName,
} from "@/features/auth/permissions";

export type NavGroup = "Utama" | "Konten" | "Organisasi" | "Sistem";

export interface NavItem {
  href: string;
  label: string;
  permission: PermissionName;
  group: NavGroup;
  icon: ReactNode;
  exact?: boolean;
}

/** Urutan dan pengelompokan mengikuti `ROUTES` di Design/admin/assets/admin.js. */
export const navGroups: NavGroup[] = ["Utama", "Konten", "Organisasi", "Sistem"];

export const navItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    permission: PERMISSIONS.DASHBOARD_VIEW,
    group: "Utama",
    exact: true,
    icon: <LayoutGrid />,
  },
  {
    href: "/admin/news",
    label: "Publikasi",
    permission: PERMISSIONS.NEWS_VIEW,
    group: "Konten",
    icon: <FileText />,
  },
  {
    href: "/admin/programs",
    label: "Program Kerja",
    permission: PERMISSIONS.PROGRAMS_VIEW,
    group: "Konten",
    icon: <ListChecks />,
  },
  {
    href: "/admin/organization",
    label: "Struktur Organisasi",
    permission: PERMISSIONS.ORGANIZATION_VIEW,
    group: "Organisasi",
    icon: <Users />,
  },
  {
    href: "/admin/accounts",
    label: "Administrator",
    permission: PERMISSIONS.ADMINS_VIEW,
    group: "Sistem",
    icon: <ShieldCheck />,
  },
  {
    href: "/admin/activity-logs",
    label: "Log Aktivitas",
    permission: PERMISSIONS.ACTIVITY_LOGS_VIEW,
    group: "Sistem",
    icon: <History />,
  },
  {
    href: "/admin/visitor-logs",
    label: "Statistik Pengunjung",
    permission: PERMISSIONS.VISITOR_LOGS_VIEW,
    group: "Sistem",
    icon: <BarChart3 />,
  },
  {
    href: "/admin/settings",
    label: "Pengaturan Situs",
    permission: PERMISSIONS.SETTINGS_VIEW,
    group: "Sistem",
    icon: <Settings />,
  },
];

/** Hanya route yang halamannya sudah ada yang tampil di menu. */
export const implementedAdminRoutes = new Set([
  "/admin/dashboard",
  "/admin/news",
  "/admin/programs",
  "/admin/organization",
  "/admin/accounts",
  "/admin/account",
  "/admin/activity-logs",
  "/admin/settings",
]);

export function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Judul halaman untuk breadcrumb topbar. */
export function pageTitleFor(pathname: string): string {
  if (pathname === "/admin/account") return "Akun Saya";
  const item = navItems.find((nav) => isItemActive(pathname, nav));
  return item?.label ?? "Admin";
}

/**
 * Sub-halaman di bawah menu (mis. `/admin/news/new` atau `/admin/news/12`)
 * untuk breadcrumb "Admin / Publikasi / Baru". `null` bila bukan sub-halaman.
 */
export function subPageFor(
  pathname: string,
): { parentHref: string; label: string } | null {
  const item = navItems.find((nav) => isItemActive(pathname, nav));
  if (!item || pathname === item.href) return null;

  const rest = pathname.slice(item.href.length + 1);
  return { parentHref: item.href, label: rest === "new" ? "Baru" : "Edit" };
}