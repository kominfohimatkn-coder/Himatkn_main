"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { PublicButtonAnchor } from "@/components/public/PublicButton";
import { PUBLIC_SETTINGS_FALLBACK } from "@/features/settings/fallback";
import type { PublicLink } from "@/features/settings/links";

type NavItem = {
  label: string;
  href: string;
  /** Link keluar situs (mis. Bank Soal) memakai <a>, bukan <Link>. */
  external?: boolean;
  target?: "_blank";
  rel?: "noopener noreferrer";
};

const navigation: NavItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/#tentang" },
  { label: "Kegiatan", href: "/program" },
  { label: "Publikasi", href: "/publikasi" },
  { label: "Struktur", href: "/struktur" },
];

/** Isi grup "Informasi" (dropdown desktop, label di menu mobile). */
type InfoItem = NavItem & { description: string };

type SiteHeaderProps = {
  brandName?: string;
  brandSubtitle?: string;
  /** `null` menyembunyikan Bank Soal di grup Informasi. */
  bankSoal?: PublicLink | null;
  /** `null` menyembunyikan tombol Instagram di menu mobile. */
  instagram?: PublicLink | null;
};

const desktopLinkBase =
  "relative py-1.5 text-sm transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-center after:bg-current after:transition-transform after:duration-200";
const desktopLinkInactive =
  "text-muted after:scale-x-0 hover:text-green-900 hover:after:scale-x-[0.6]";
const desktopLinkActive = "text-green-800 after:scale-x-100";

/** Item menu ponsel: kartu ringkas, sans 14px, tinggi 40px. */
const mobileLinkBase =
  "flex min-h-10 items-center rounded-[3px] px-3 text-sm transition-colors hover:bg-mint focus-visible:bg-mint";
const mobileLinkInactive = "text-green-900";
const mobileLinkActive =
  "font-semibold text-green-800 shadow-[inset_3px_0_0_#0f4d36]";

export function SiteHeader({
  brandName = PUBLIC_SETTINGS_FALLBACK.brand_name,
  brandSubtitle = PUBLIC_SETTINGS_FALLBACK.brand_subtitle,
  bankSoal = null,
  instagram = null,
}: SiteHeaderProps = {}) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const infoItems: InfoItem[] = [
    ...(bankSoal
      ? [
          {
            label: bankSoal.label,
            href: bankSoal.href,
            external: true,
            target: bankSoal.target,
            rel: bankSoal.rel,
            description: "Arsip soal ujian di Google Drive",
          },
        ]
      : []),
    { label: "Dokumen", href: "/dokumen", description: "Dokumen resmi himpunan" },
  ];

  function isActive(item: NavItem): boolean {
    if (item.external) return false;
    if (item.href === "/") return pathname === "/";

    const path = item.href.split("#")[0];
    if (!path || path === "/") return false;

    return pathname === path || pathname.startsWith(`${path}/`);
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
      className="sticky top-0 z-50 h-(--header-h) border-b border-line bg-paper"
    >
      <div className="site-container flex h-full items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-3 text-green-900">
          <Image
            src="/favicon.png"
            alt={`Logo ${brandName}`}
            width={29}
            height={36}
            priority
            className="shrink-0"
          />
          <span>
            <span className="block font-serif text-[13px] leading-[1.1] font-bold tracking-[0.01em] text-green-900 uppercase min-[641px]:text-[15px]">
              {brandName}
            </span>
            <span className="mt-0.75 block text-[10px] leading-[1.3] font-medium tracking-[0.08em] text-muted uppercase min-[641px]:text-[11px]">
              {brandSubtitle}
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 min-[961px]:flex"
          aria-label="Navigasi utama"
        >
          {navigation.map((item) => {
            const active = isActive(item);

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

          <InfoMenu items={infoItems} isActive={isActive} />
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
          aria-controls="public-mobile-navigation"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          className="-mr-2.5 flex size-11 shrink-0 flex-col items-center justify-center gap-1 text-green-900 min-[961px]:hidden"
        >
          <span
            className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${
              isOpen ? "translate-y-[6px] rotate-45" : ""
            }`}
            aria-hidden="true"
          />
          <span
            className={`block h-0.5 w-5 bg-current transition-opacity duration-200 ${
              isOpen ? "opacity-0" : ""
            }`}
            aria-hidden="true"
          />
          <span
            className={`block h-0.5 w-5 bg-current transition-transform duration-200 ${
              isOpen ? "-translate-y-[6px] -rotate-45" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </div>

      <div
        ref={panelRef}
        id="public-mobile-navigation"
        className={`fixed top-[calc(var(--header-h)+8px)] right-6 z-40 max-h-[calc(100dvh-var(--header-h)-16px)] w-64 origin-top-right overflow-y-auto overscroll-contain rounded-[4px] border border-line bg-white p-1.5 shadow-[0_16px_30px_rgba(6,38,27,0.12)] transition-[opacity,scale,visibility] duration-150 motion-reduce:transition-none max-[640px]:right-4 min-[961px]:hidden ${
          isOpen ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <nav aria-label="Navigasi mobile">
          {navigation.map((item) => {
            const active = isActive(item);

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

          <p className="mx-3 mt-1.5 border-t border-line pt-3 pb-1 text-[11px] font-semibold tracking-[0.1em] text-[#8A9590] uppercase">
            Informasi
          </p>
          {infoItems.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target={item.target ?? "_blank"}
                rel={item.rel ?? "noopener noreferrer"}
                onClick={() => setIsOpen(false)}
                className={`${mobileLinkBase} ${mobileLinkInactive} gap-1.5`}
              >
                {item.label}
                <span aria-hidden="true" className="text-muted">↗</span>
                <span className="sr-only">(membuka Google Drive di tab baru)</span>
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                aria-current={isActive(item) ? "page" : undefined}
                className={`${mobileLinkBase} ${isActive(item) ? mobileLinkActive : mobileLinkInactive}`}
              >
                {item.label}
              </Link>
            ),
          )}

          {instagram ? (
            <PublicButtonAnchor
              href={instagram.href}
              target={instagram.target}
              rel={instagram.rel}
              tone="solid"
              onClick={() => setIsOpen(false)}
              className="mt-1.5 flex min-h-10! w-full justify-center py-3!"
            >
              {instagram.label}
            </PublicButtonAnchor>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

/**
 * Dropdown "Informasi" (Bank Soal + Dokumen), mengikuti `.nav__group` di
 * Design/assets: terbuka saat hover atau klik, tertutup saat kursor/fokus
 * keluar, klik di luar, atau Escape.
 */
function InfoMenu({
  items,
  isActive,
}: {
  items: InfoItem[];
  isActive: (item: NavItem) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const groupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = items.some((item) => isActive(item));

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!groupRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={groupRef}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!groupRef.current?.contains(event.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls="nav-info"
        onClick={() => setOpen((value) => !value)}
        className={`${desktopLinkBase} inline-flex cursor-pointer items-center gap-1.5 ${
          current ? desktopLinkActive : open ? "text-green-900 after:scale-x-0" : desktopLinkInactive
        }`}
      >
        Informasi
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 3.5 5 6.5 8 3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      <div
        id="nav-info"
        className={`absolute top-[calc(100%+20px)] -right-3 z-60 min-w-[264px] rounded-[4px] border border-line bg-white p-1.5 shadow-[0_16px_30px_rgba(6,38,27,0.1)] transition-[opacity,transform,visibility] duration-150 before:absolute before:inset-x-0 before:-top-[21px] before:h-[21px] motion-reduce:transition-none ${
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"
        }`}
      >
        {items.map((item) => {
          const active = isActive(item);
          const body = (
            <>
              <strong className={`block text-sm font-semibold ${active ? "text-green-800" : "text-green-900"}`}>
                {item.label}
                {item.external ? (
                  <span aria-hidden="true" className="font-medium text-muted">
                    {" "}
                    ↗
                  </span>
                ) : null}
              </strong>
              <small className="mt-0.5 block text-xs text-muted">{item.description}</small>
            </>
          );
          const itemClass = `block rounded-[3px] px-3 py-2.5 hover:bg-mint focus-visible:bg-mint ${
            active ? "shadow-[inset_3px_0_0_#0f4d36]" : ""
          }`;

          return item.external ? (
            <a
              key={item.href}
              href={item.href}
              target={item.target ?? "_blank"}
              rel={item.rel ?? "noopener noreferrer"}
              onClick={() => setOpen(false)}
              className={itemClass}
            >
              {body}
              <span className="sr-only">(membuka Google Drive di tab baru)</span>
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              aria-current={active ? "page" : undefined}
              className={itemClass}
            >
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}