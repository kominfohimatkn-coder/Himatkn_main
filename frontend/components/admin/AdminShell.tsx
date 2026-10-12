"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type ReactNode,
  useMemo,
  useState,
} from "react";

import { useAuth } from "@/context/AuthContext";

type Permission =
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

interface NavItem {
  href: string;
  label: string;
  permission: Permission;
  icon: ReactNode;
  exact?: boolean;
}

function Icon({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <span
      aria-hidden="true"
      className="flex h-5 w-5 shrink-0 items-center justify-center"
    >
      {children}
    </span>
  );
}

const navItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    permission: "dashboard.view",
    exact: true,
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </Icon>
    ),
  },
  {
    href: "/admin/news",
    label: "News",
    permission: "news.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M5 4h14v16H5z" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      </Icon>
    ),
  },
  {
    href: "/admin/programs",
    label: "Program Kerja",
    permission: "programs.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="15" />
          <path d="M8 5V3h8v2M8 10h8M8 14h5" />
        </svg>
      </Icon>
    ),
  },
  {
    href: "/admin/agendas",
    label: "Agenda",
    permission: "agendas.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="5" width="18" height="16" />
          <path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h6" />
        </svg>
      </Icon>
    ),
  },
  {
    href: "/admin/organization",
    label: "Organisasi",
    permission: "organization.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="7" r="3" />
          <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
          <path d="M5 10a3 3 0 0 0-2 3v2M19 10a3 3 0 0 1 2 3v2" />
        </svg>
      </Icon>
    ),
  },
  {
    href: "/admin/documents",
    label: "Dokumen",
    permission: "documents.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 3h9l4 4v14H6z" />
          <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
      </Icon>
    ),
  },
];

const managementItems: NavItem[] = [
  {
    href: "/admin/notifications",
    label: "Notifikasi",
    permission: "notifications.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      </Icon>
    ),
  },
  {
    href: "/admin/admins",
    label: "Administrator",
    permission: "admins.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
          <path d="M17 5h4M19 3v4" />
        </svg>
      </Icon>
    ),
  },
  {
    href: "/admin/activity-logs",
    label: "Activity Logs",
    permission: "activity_logs.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 4h16v16H4z" />
          <path d="M8 8h8M8 12h5M8 16h7" />
        </svg>
      </Icon>
    ),
  },
  {
    href: "/admin/visitor-logs",
    label: "Visitor Logs",
    permission: "visitor_logs.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.2 2.4 3.3 5.4 3.3 9S14.2 18.6 12 21c-2.2-2.4-3.3-5.4-3.3-9S9.8 5.4 12 3Z" />
        </svg>
      </Icon>
    ),
  },
  {
    href: "/admin/settings",
    label: "Pengaturan",
    permission: "settings.view",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </Icon>
    ),
  },
];

function isItemActive(
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

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "A";
}

function SidebarContent({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { admin, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const permissions = useMemo(
    () => new Set(admin?.permissions ?? []),
    [admin?.permissions],
  );

  const visiblePrimaryItems = navItems.filter((item) =>
    permissions.has(item.permission),
  );

  const visibleManagementItems = managementItems.filter((item) =>
    permissions.has(item.permission),
  );

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      router.replace("/login");
    }
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-zinc-200 px-5 py-5">
        <div className="text-sm font-semibold tracking-[0.18em] text-zinc-950">
          HIMATKN
        </div>
        <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-zinc-400">
          Admin Panel
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
          Workspace
        </p>

        <nav className="space-y-1">
          {visiblePrimaryItems.map((item) => {
            const active = isItemActive(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={[
                  "flex min-h-11 items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition-colors",
                  active
                    ? "border-zinc-950 bg-zinc-100 font-medium text-zinc-950"
                    : "border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
                ].join(" ")}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {visibleManagementItems.length > 0 && (
          <div className="mt-7">
            <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              Management
            </p>

            <nav className="space-y-1">
              {visibleManagementItems.map((item) => {
                const active = isItemActive(pathname, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={[
                      "flex min-h-11 items-center gap-3 border-l-2 px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "border-zinc-950 bg-zinc-100 font-medium text-zinc-950"
                        : "border-transparent text-zinc-500 hover:bg-zinc-50 hover:text-zinc-950",
                    ].join(" ")}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      <div className="border-t border-zinc-200 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center bg-zinc-950 text-sm font-semibold text-white">
            {getInitial(admin?.username ?? "")}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-950">
              {admin?.username ?? "Admin"}
            </p>
            <p className="truncate text-xs text-zinc-400">
              {admin?.roles?.join(", ") || "Administrator"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-2 flex min-h-11 w-full items-center gap-3 px-3 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M9 4H5v16h4M14 8l4 4-4 4M10 12h8" />
            </svg>
          </Icon>

          <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
        </button>
      </div>
    </div>
  );
}

export function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-200 lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 w-70 border-r border-zinc-200 transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <SidebarContent
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center text-zinc-700"
            aria-label="Buka menu"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="text-sm font-semibold tracking-[0.16em]">
            HIMATKN
          </div>

          <div className="h-11 w-11" />
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}