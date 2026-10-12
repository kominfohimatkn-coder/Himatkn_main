import type { ReactNode } from "react";

export type Permission =
  | "dashboard.view"
  | "news.view"
  | "programs.view"
  | "agendas.view"
  | "organization.view"
  | "documents.view"
  | "notifications.view"
  | "settings.view"
  | "admins.view"
  | "activity_logs.view"
  | "visitor_logs.view";

export interface NavItem {
  href: string;
  label: string;
  permission: Permission;
  icon: ReactNode;
  exact?: boolean;
}

export function NavIcon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center [&>svg]:h-5 [&>svg]:w-5"
    >
      {children}
    </span>
  );
}

export const primaryNavItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    permission: "dashboard.view",
    exact: true,
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/admin/news",
    label: "News",
    permission: "news.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/admin/programs",
    label: "Program Kerja",
    permission: "programs.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="15" />
          <path d="M8 5V3h8v2M8 10h8M8 14h5" />
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/admin/agendas",
    label: "Agenda",
    permission: "agendas.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="16" />
          <path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h6" />
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/admin/organization",
    label: "Organisasi",
    permission: "organization.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="7" r="3" />
          <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
          <path d="M5 10a3 3 0 0 0-2 3v2M19 10a3 3 0 0 1 2 3v2" />
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/admin/documents",
    label: "Dokumen",
    permission: "documents.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      </NavIcon>
    ),
  },
];

export const managementNavItems: NavItem[] = [
  {
    href: "/admin/notifications",
    label: "Notifikasi",
    permission: "notifications.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/admin/admins",
    label: "Administrator",
    permission: "admins.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
          <path d="M17 5h4M19 3v4" />
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/admin/activity-logs",
    label: "Activity Logs",
    permission: "activity_logs.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8M8 12h5M8 16h7" />
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/admin/visitor-logs",
    label: "Visitor Logs",
    permission: "visitor_logs.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" />
        </svg>
      </NavIcon>
    ),
  },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    permission: "settings.view",
    icon: (
      <NavIcon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </NavIcon>
    ),
  },
];

export function isItemActive(
  pathname: string,
  item: NavItem,
): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return (
    pathname === item.href ||
    pathname.startsWith(`${item.href}/`)
  );
}