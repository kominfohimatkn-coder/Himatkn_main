"use client";

import Link from "next/link";

import { useAuth } from "@/features/auth/AuthContext";

import {
  implementedAdminRoutes,
  isItemActive,
  navGroups,
  navItems,
} from "./admin-navigation";

/** Logo garis dari `LOGO` di Design/admin/assets/admin.js. */
export function AdminLogo({ className = "size-7.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={`shrink-0 ${className}`}>
      <g fill="none" stroke="#C9D6CF" strokeWidth="2.2">
        <path d="M20 21 C12 4, 2 8, 4 14 C6 20, 14 21, 20 21Z" />
        <path d="M20 21 C28 4, 38 8, 36 14 C34 20, 26 21, 20 21Z" />
        <path d="M20 21 C14 28, 16 38, 20 38 C24 38, 26 28, 20 21Z" />
      </g>
      <polygon
        points="20,16.5 23.5,18.5 23.5,22.5 20,24.5 16.5,22.5 16.5,18.5"
        fill="#06261B"
        stroke="#C9D6CF"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/** `.sidebar` di Design/admin/assets/admin.css. */
export function AdminSidebar({
  pathname,
  periodName,
  onNavigate,
}: {
  pathname: string;
  periodName: string | null;
  onNavigate?: () => void;
}) {
  const { can } = useAuth();

  const visibleItems = navItems.filter(
    (item) => can(item.permission) && implementedAdminRoutes.has(item.href),
  );

  return (
    <div className="flex h-full flex-col bg-green-950 text-white">
      <Link
        href="/admin/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-3 border-b border-line-on-dark px-5 pt-5 pb-4.5 no-underline"
      >
        <AdminLogo />
        <span>
          <span className="block font-serif text-[13px] leading-[1.15] font-bold tracking-[0.02em] uppercase">
            Hima Teknokimia Nuklir
          </span>
          <span className="mt-0.75 block text-[11px] leading-[1.3] font-medium tracking-widest text-on-dark-muted uppercase">
            Panel Admin
          </span>
        </span>
      </Link>

      <nav aria-label="Navigasi admin" className="flex-1 px-3 pt-3.5 pb-5">
        {navGroups.map((group) => {
          const items = visibleItems.filter((item) => item.group === group);

          if (items.length === 0) return null;

          return (
            <div key={group} className="mt-4.5 first:mt-0">
              <p className="px-2.5 pb-2 text-[11px] font-semibold tracking-widest text-[#93ACA0] uppercase">
                {group}
              </p>

              {items.map((item) => {
                const active = isItemActive(pathname, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-9.5 items-center gap-2.75 rounded-sm px-2.5 text-[13.5px] no-underline transition-colors [&_svg]:size-4.25 [&_svg]:shrink-0 ${
                      active
                        ? "bg-[rgba(227,238,232,0.1)] text-white before:absolute before:top-2 before:bottom-2 before:-left-3 before:w-0.75 before:rounded-r-xs before:bg-mint [&_svg]:opacity-100"
                        : "text-[#C9D6CF] hover:bg-white/5 hover:text-white [&_svg]:opacity-80"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-line-on-dark px-5 pt-3.5 pb-4.5 text-xs text-on-dark-muted">
        Periode aktif{" "}
        <strong className="text-white">{periodName ?? "belum ada"}</strong>
      </div>
    </div>
  );
}