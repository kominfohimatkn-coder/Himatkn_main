"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BrandMark } from "@/components/public/BrandMark";
import { PUBLIC_LINKS } from "@/lib/public/link";

const navigation = [
  { label: "Beranda", href: "/#beranda" },
  { label: "Tentang", href: "/#tentang" },
  { label: "Program Kerja", href: "/#program" },
  { label: "Struktur", href: "/struktur" },
  { label: "Kontak", href: "/#kontak" },
  { label: "Bank Soal", href: PUBLIC_LINKS.bankSoal.href, target: "_blank", rel: "noopener noreferrer" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const isHome = pathname === "/";

  function isActive(href: string): boolean {
    if (href === "/struktur") {
      return pathname === "/struktur";
    }

    return isHome && href === "/#beranda";
  }

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      setIsOpen(false);
      toggleRef.current?.focus();
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <header
      data-tone="dark"
      className="absolute inset-x-0 top-0 z-50 transition-colors"
    >
      <div className="site-container flex min-h-15 items-center justify-between gap-6 min-[900px]:min-h-18">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 text-on-dark"
          aria-label="HIMATKN | Beranda"
        >
          <BrandMark className="h-6 w-6 shrink-0 text-on-dark" />
          <span className="font-mono text-[9px] font-medium tracking-[0.16em] uppercase sm:text-[10px]">
            HIMA Teknokimia Nuklir
          </span>
        </Link>

        <nav
          className="hidden items-center gap-6 min-[1000px]:flex"
          aria-label="Navigasi utama"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="public-nav-link"
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          ref={toggleRef}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="-mr-2 flex min-h-11 min-w-11 items-center justify-center text-on-dark min-[1000px]:hidden"
          aria-label={isOpen ? "Tutup menu" : "Buka menu"}
          aria-expanded={isOpen}
          aria-controls="public-mobile-navigation"
        >
          {isOpen ? (
            <X className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Menu className="h-6 w-6" aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id="public-mobile-navigation"
        className={`${
          isOpen ? "block" : "hidden"
        } border-t border-on-dark/15 bg-deep min-[1000px]:hidden`}
      >
        <nav
          className="site-container grid py-2"
          aria-label="Navigasi mobile"
        >
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              aria-current={isActive(item.href) ? "page" : undefined}
              className="border-b border-on-dark/10 py-3 font-mono text-[12px] tracking-[0.06em] text-on-dark uppercase last:border-b-0 hover:text-gold-bright"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
