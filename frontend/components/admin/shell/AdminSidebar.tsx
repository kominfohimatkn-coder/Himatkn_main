"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { useAuth } from "@/features/auth/AuthContext";

import {
  implementedAdminRoutes,
  isItemActive,
  managementNavItems,
  NavIcon,
  primaryNavItems,
} from "./admin-navigation";

function getInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "A";
}

export function AdminSidebar({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  const { admin, isSuperadmin, logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const permissions = useMemo(
    () => new Set(admin?.permissions ?? []),
    [admin?.permissions],
  );
  
const visiblePrimaryItems = primaryNavItems.filter(
  (item) =>
    permissions.has(item.permission) &&
    implementedAdminRoutes.has(item.href),
);

const visibleManagementItems = managementNavItems.filter(
  (item) =>
    permissions.has(item.permission) &&
    implementedAdminRoutes.has(item.href),
);
  
  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      router.replace("/login");
    } catch {
      setLogoutError(
        "Logout gagal. Sesi server belum dapat dipastikan berakhir. Silakan coba lagi.",
      );
    } finally {
      setIsLoggingOut(false);
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
            <Link
              href="/admin/account"
              onClick={onNavigate}
              className="block truncate text-sm font-medium text-zinc-950 underline-offset-4 hover:underline"
              title="Akun saya"
            >
              {admin?.username ?? "Admin"}
            </Link>
            <p className="truncate text-xs text-zinc-400">
              {isSuperadmin ? "Superadmin" : "Pengurus"}
              <span aria-hidden="true"> · </span>
              <Link
                href="/admin/account"
                onClick={onNavigate}
                className="underline-offset-4 hover:text-zinc-700 hover:underline"
              >
                Akun saya
              </Link>
            </p>
          </div>
        </div>

        {logoutError && (
          <p
            role="alert"
            className="px-2 pt-2 text-xs leading-relaxed text-red-600"
          >
            {logoutError}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="mt-2 flex min-h-11 w-full items-center gap-3 px-3 text-sm transition-colors bg-red-700 hover:bg-red-800 text-white! rounded-b-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          <NavIcon>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M9 4H5v16h4M14 8l4 4-4 4M10 12h8" />
            </svg>
          </NavIcon>

          <span>{isLoggingOut ? "Keluar..." : "Keluar"}</span>
        </button>
      </div>
    </div>
  );
}