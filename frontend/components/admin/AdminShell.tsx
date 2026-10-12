"use client";

import { usePathname } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  function closeMobileMenu() {
  setMobileOpen(false);
  menuButtonRef.current?.focus();
}

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
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-zinc-200 lg:block">
        <AdminSidebar pathname={pathname} />
      </aside>
  
    {mobileOpen && (
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default bg-black/40 lg:hidden"
        aria-label="Tutup menu navigasi"
        onClick={closeMobileMenu}
      />
    )}

    {mobileOpen && (
      <aside
        id="mobile-admin-navigation"
        aria-label="Navigasi admin"
        className="fixed inset-y-0 left-0 z-50 w-70 border-r border-zinc-200 lg:hidden"
      >
        <AdminSidebar
          pathname={pathname}
          onNavigate={closeMobileMenu}
        />
      </aside>
    )}


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

        <div className="min-h-[calc(100vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );
}