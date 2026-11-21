"use client";

import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ToastProvider } from "@/components/admin/shared/Toast";
import { getPublicOrganization } from "@/features/organization/public-api";

import { pageTitleFor, subPageFor } from "./admin-navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

/**
 * Kerangka panel admin, mengikuti `.shell` di Design/admin/assets/admin.css:
 * sidebar 256px (≤900px menjadi panel geser), topbar 64px, lalu konten.
 * Konten tidak diberi padding di sini; tiap halaman memakai <AdminPage>.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [periodName, setPeriodName] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getPublicOrganization({ signal: controller.signal })
      .then((data) => setPeriodName(data.period?.name ?? null))
      .catch(() => {
        /* Nama periode hanya informasi tambahan di sidebar. */
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobileMenu();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  return (
    <div className="admin-theme min-h-screen">
      <a
        href="#content"
        className="absolute -top-16 left-3 z-200 rounded-sm bg-green-800 px-3.5 py-2 text-white focus:top-3"
      >
        Langsung ke konten
      </a>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Tutup navigasi"
          className="fixed inset-0 z-[65] cursor-default bg-[rgba(6,38,27,0.42)] min-[901px]:hidden"
          onClick={closeMobileMenu}
        />
      ) : null}

      <aside
        id="admin-navigation"
        aria-label="Navigasi admin"
        className={`fixed inset-y-0 left-0 z-[70] w-[280px] overflow-y-auto border-r border-line-on-dark transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] min-[901px]:z-40 min-[901px]:w-64 min-[901px]:translate-x-0 ${
          mobileOpen
            ? "translate-x-0 shadow-[20px_0_50px_rgba(6,38,27,0.3)]"
            : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          pathname={pathname}
          periodName={periodName}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col min-[901px]:pl-64">
        <AdminTopbar
          title={pageTitleFor(pathname)}
          subPage={subPageFor(pathname)}
          menuOpen={mobileOpen}
          onMenuOpen={() => setMobileOpen(true)}
          menuButtonRef={menuButtonRef}
        />

        <div id="content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </div>
    </div>
  );
}