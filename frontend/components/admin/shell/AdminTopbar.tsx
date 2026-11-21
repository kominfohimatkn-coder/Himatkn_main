"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, LogOut, Menu, UserRound } from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";

function initials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part.charAt(0));
  return (letters.join("") || "A").toUpperCase();
}

/** `.topbar` + `.crumbs` + `.user` + `.dropdown` di Design/admin/assets/admin.css. */
export function AdminTopbar({
  title,
  subPage,
  menuOpen,
  onMenuOpen,
  menuButtonRef,
}: {
  title: string;
  subPage: { parentHref: string; label: string } | null;
  menuOpen: boolean;
  onMenuOpen: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { admin, isSuperadmin, logout } = useAuth();
  const router = useRouter();
  const [userOpen, setUserOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userOpen) return;

    function handleClick(event: MouseEvent) {
      if (!userRef.current?.contains(event.target as Node)) {
        setUserOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setUserOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [userOpen]);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      router.replace("/login");
    } catch {
      setLogoutError("Logout gagal. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const username = admin?.username ?? "Admin";
  const roleLabel = isSuperadmin ? "Superadmin" : "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-[rgba(251,253,252,0.94)] px-4 backdrop-blur-[8px] min-[901px]:px-8">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuOpen}
        aria-label="Buka navigasi"
        aria-expanded={menuOpen}
        aria-controls="admin-navigation"
        className="grid size-[38px] cursor-pointer place-items-center rounded-[4px] text-muted hover:bg-mint-50 hover:text-green-900 min-[901px]:hidden [&_svg]:size-[19px]"
      >
        <Menu aria-hidden="true" />
      </button>

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-2 text-xs text-muted"
      >
        <Link
          href="/admin/dashboard"
          className="text-muted no-underline hover:text-green-800"
        >
          Admin
        </Link>
        <span aria-hidden="true">/</span>
        {subPage ? (
          <>
            <Link
              href={subPage.parentHref}
              className="truncate text-muted no-underline hover:text-green-800"
            >
              {title}
            </Link>
            <span aria-hidden="true">/</span>
            <strong className="font-semibold text-green-900">{subPage.label}</strong>
          </>
        ) : (
          <strong className="truncate font-semibold text-green-900">{title}</strong>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          aria-label="Lihat situs (tab baru)"
          className="inline-flex h-8 w-[34px] items-center justify-center gap-2 rounded-[4px] border border-line-strong bg-white text-[11px] leading-none font-semibold tracking-[0.08em] text-green-900 uppercase no-underline transition-colors hover:border-green-800 min-[901px]:w-auto min-[901px]:px-[11px] [&_svg]:size-[15px]"
        >
          <ExternalLink aria-hidden="true" />
          <span className="hidden min-[901px]:inline">Lihat situs</span>
        </a>

        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            className="flex cursor-pointer items-center gap-2.5 rounded-[4px] border border-transparent bg-transparent py-1 pr-1.5 pl-1 hover:border-line hover:bg-white"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-green-800 text-xs font-bold text-white">
              {initials(username)}
            </span>
            <span className="hidden text-left min-[901px]:block">
              <span className="block text-[13px] leading-[1.2] font-semibold text-ink">
                {username}
              </span>
              <span className="block text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                {roleLabel}
              </span>
            </span>
          </button>

          {userOpen ? (
            <div
              role="menu"
              className="absolute top-[calc(100%+6px)] right-0 z-40 min-w-60 rounded-[6px] border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(6,38,27,0.12)]"
            >
              <div className="mb-1.5 border-b border-line px-2.5 pt-2.5 pb-2">
                <p className="text-[13px] font-semibold text-ink">{username}</p>
                <p className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                  {roleLabel}
                </p>
              </div>

              <Link
                href="/admin/account"
                role="menuitem"
                onClick={() => setUserOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-[3px] px-2.5 py-[9px] text-[13px] text-ink no-underline hover:bg-mint-50 [&_svg]:size-4 [&_svg]:text-muted"
              >
                <UserRound aria-hidden="true" />
                Akun saya
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[3px] border-0 bg-transparent px-2.5 py-[9px] text-left text-[13px] text-ink hover:bg-mint-50 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4 [&_svg]:text-muted"
              >
                <LogOut aria-hidden="true" />
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </button>

              {logoutError ? (
                <p role="alert" className="px-2.5 pt-1 pb-2 text-xs text-danger">
                  {logoutError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}