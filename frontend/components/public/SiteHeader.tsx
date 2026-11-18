"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PUBLIC_LINKS } from "@/features/settings/links";

type NavItem = {
  label: string;
  href: string;
  /** Link keluar situs (mis. Bank Soal) memakai <a>, bukan <Link>. */
  external?: boolean;
};

const navigation: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/#tentang" },
  // Sementara: route /kegiatan belum ada. Target diganti saat route tersedia.
  { label: "Kegiatan", href: "/#program" },
  // Sementara: route /publikasi belum ada. Target diganti saat route tersedia.
  { label: "Publikasi", href: "/#publikasi" },
  {
    label: PUBLIC_LINKS.bankSoal.label,
    href: PUBLIC_LINKS.bankSoal.href,
    external: true,
  },
  { label: "Struktur", href: "/struktur" },
];

const desktopLinkBase = "border-b-2 py-1.5 text-sm transition-colors";
const desktopLinkInactive =
  "border-transparent text-muted hover:text-green-900";
const desktopLinkActive = "border-green-800 text-green-800";

const mobileLinkBase =
  "flex min-h-12 items-center border-b border-line py-3.5 font-serif text-[17px] font-semibold transition-colors";
const mobileLinkInactive = "text-green-900 hover:text-green-800";
const mobileLinkActive =
  "border-l-[3px] border-l-green-800 pl-3 text-green-800";

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  function isActive(item: NavItem): boolean {
    if (item.external) return false;
    if (item.href === "/") return pathname === "/";
    return item.href === pathname;
  }

  // Escape menutup panel, klik di luar header juga menutup, dan fokus
  // dikembalikan ke tombol menu.
  useEffect(() => {
    if (!isOpen) return;

    function closeAndRestoreFocus() {
      setIsOpen(false);
      toggleRef.current?.focus();
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeAndRestoreFocus();
        return;
      }

      if (event.key !== "Tab") return;

      // Focus trap sederhana: tombol menu + tautan panel. Tombol ikut
      // dihitung supaya kontrol penutup tetap terjangkau dengan keyboard.
      const focusables = [
        toggleRef.current,
        ...(panelRef.current?.querySelectorAll<HTMLElement>("a[href]") ?? []),
      ].filter((element): element is HTMLElement => element !== null);

      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!focusables.includes(active as HTMLElement)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (target && headerRef.current?.contains(target)) return;

      // Klik pada elemen non-interaktif (mis. area kosong) mengembalikan fokus
      // ke tombol menu. Klik pada tautan/kontrol dibiarkan mengikuti pointer.
      const element = target instanceof Element ? target : null;
      const isInteractive = Boolean(
        element?.closest("a,button,input,select,textarea,[tabindex]"),
      );

      if (isInteractive) {
        setIsOpen(false);
        return;
      }

      setIsOpen(false);
      // Dipindahkan ke frame berikutnya supaya fokus tidak ditimpa oleh
      // default action pointerdown.
      requestAnimationFrame(() => toggleRef.current?.focus());
    }

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen]);

  // Kunci scroll body selama panel terbuka.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Panel hanya ada di bawah 961px; tutup saat viewport melebar.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 961px)");
    function handleChange(event: MediaQueryListEvent) {
      if (event.matches) setIsOpen(false);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 h-[var(--header-h)] border-b border-line bg-paper"
    >
      <div className="site-container flex h-full items-center justify-between gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-green-900"
        >
          <Image
            src="/favicon.png"
            alt="Logo HIMATKN"
            width={29}
            height={36}
            priority
            className="shrink-0"
          />
          <span>
            <span className="block font-serif text-[13px] leading-[1.1] font-bold tracking-[0.01em] text-green-900 uppercase min-[641px]:text-[15px]">
              Hima Teknokimia Nuklir
            </span>
            <span className="mt-[3px] block text-[10px] leading-[1.3] font-medium tracking-[0.08em] text-muted uppercase min-[641px]:text-[11px]">
              Politeknik Teknologi Nuklir
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 min-[961px]:flex"
          aria-label="Navigasi utama"
        >
          {navigation.map((item) => {
            const active = isActive(item);

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel={PUBLIC_LINKS.bankSoal.rel}
                  className={`${desktopLinkBase} ${desktopLinkInactive} inline-flex items-center gap-1`}
                >
                  {item.label}
                  <ExternalLink className="size-3" aria-hidden="true" />
                  <span className="sr-only">
                    (membuka Google Drive di tab baru)
                  </span>
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`${desktopLinkBase} ${active ? desktopLinkActive : desktopLinkInactive}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="public-mobile-navigation"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          className="-mr-2.5 flex size-11 shrink-0 items-center justify-center text-green-900 min-[961px]:hidden"
        >
          {isOpen ? (
            <X className="size-6" aria-hidden="true" />
          ) : (
            <Menu className="size-6" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        ref={panelRef}
        id="public-mobile-navigation"
        className={`fixed inset-x-0 top-[var(--header-h)] z-40 border-b border-line bg-paper px-6 pt-2 pb-6 shadow-[0_16px_30px_rgba(6,38,27,0.1)] transition-[opacity,transform,visibility] duration-200 motion-reduce:transition-none max-[640px]:px-4 min-[961px]:hidden ${
          isOpen
            ? "visible translate-y-0 opacity-100"
            : "invisible -translate-y-2.5 opacity-0"
        }`}
      >
        <nav aria-label="Navigasi mobile">
          {navigation.map((item) => {
            const active = isActive(item);

            if (item.external) {
              return (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel={PUBLIC_LINKS.bankSoal.rel}
                  onClick={() => setIsOpen(false)}
                  className={`${mobileLinkBase} ${mobileLinkInactive} justify-between`}
                >
                  {item.label}
                  <span className="flex items-center gap-2 text-muted">
                    <span className="sr-only">
                      (membuka Google Drive di tab baru)
                    </span>
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </span>
                </a>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                aria-current={active ? "page" : undefined}
                className={`${mobileLinkBase} ${active ? mobileLinkActive : mobileLinkInactive}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
