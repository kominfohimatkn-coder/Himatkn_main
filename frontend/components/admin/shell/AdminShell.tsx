
"use client";

import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  const handleNavigate = useCallback(() => {
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, closeMobileMenu]);

  return (
    <div className="admin-theme min-h-screen bg-zinc-50 text-zinc-950">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          className="fixed inset-0 z-40 cursor-default bg-black/40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside
        id="admin-navigation"
        aria-label="Navigasi admin"
        className={[
          "fixed inset-y-0 left-0 z-50 w-70 border-r border-zinc-200 bg-white transition-transform duration-200 lg:z-40 lg:w-64 lg:translate-x-0 lg:visible",
          mobileOpen
            ? "visible translate-x-0"
            : "invisible -translate-x-full",
        ].join(" ")}
      >
        <AdminSidebar
          pathname={pathname}
          onNavigate={handleNavigate}
        />
      </aside>

      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 sm:px-6 lg:hidden">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-11 w-11 items-center justify-center text-zinc-700"
            aria-label={mobileOpen ? "Menu terbuka" : "Buka menu"}
            aria-expanded={mobileOpen}
            aria-controls="admin-navigation"
          >
            <svg
              className="h-6 w-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="text-sm font-semibold tracking-[0.16em]">
            HIMATKN
          </div>

          <div className="h-11 w-11" aria-hidden="true" />
        </header>

        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}
