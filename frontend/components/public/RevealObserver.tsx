"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Keadaan awal sebelum muncul (`.reveal` di prototipe). */
const HIDDEN = ["opacity-0", "translate-y-[22px]"];
const MOTION = ["transition", "duration-700", "ease-out-expo"];
/** Jeda antar-elemen bersaudara: 70 ms, maksimal 5 langkah. */
const STAGGER_MS = 70;
const MAX_STEPS = 5;

/**
 * Elemen bertanda `data-reveal` muncul (naik + memudar) saat di-scroll ke
 * layar, mengikuti `initReveal()` di Design/assets/app.js.
 *
 * - Elemen yang sudah terlihat saat halaman dibuka dibiarkan apa adanya,
 *   supaya tidak berkedip (tampil → hilang → muncul lagi) setelah hidrasi.
 *   Posisi dibaca dari laporan pertama IntersectionObserver, bukan saat efek
 *   berjalan, karena isi halaman bisa masih di wadah streaming tersembunyi.
 * - Tanpa JavaScript atau dengan "kurangi gerakan", semua tetap terlihat.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const hidden = new Set<HTMLElement>();
    const seen = new WeakSet<Element>();

    function reveal(element: HTMLElement) {
      element.classList.remove(...HIDDEN);
      hidden.delete(element);
      // Setelah muncul, kembalikan transisi bawaan elemen (mis. hover).
      element.addEventListener(
        "transitionend",
        () => {
          element.classList.remove(...MOTION);
          element.style.transitionDelay = "";
        },
        { once: true },
      );
    }

    // Laporan pertama observer (setelah tata letak selesai) menentukan:
    // sudah di layar → dibiarkan; di bawah layar → disembunyikan dulu.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;

          if (!seen.has(element)) {
            seen.add(element);
            const box = entry.boundingClientRect;
            // Sudah tampak (walau sebagian) → biarkan, supaya tidak berkedip.
            if (box.height > 0 && box.top < window.innerHeight) {
              observer.unobserve(element);
              continue;
            }
            const siblings = Array.from(element.parentElement?.children ?? []).filter(
              (child) => child.hasAttribute("data-reveal"),
            );
            const step = Math.min(Math.max(siblings.indexOf(element), 0), MAX_STEPS);
            element.style.transitionDelay = `${step * STAGGER_MS}ms`;
            element.classList.add(...MOTION, ...HIDDEN);
            hidden.add(element);
            continue;
          }

          if (entry.isIntersecting) {
            observer.unobserve(element);
            reveal(element);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );

    const targets = document.querySelectorAll<HTMLElement>(
      "[data-reveal]:not([data-reveal-ready])",
    );
    for (const element of targets) {
      element.setAttribute("data-reveal-ready", "");
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
      // Elemen yang belum sempat muncul (mis. footer) jangan tertinggal tersembunyi.
      for (const element of hidden) element.classList.remove(...HIDDEN);
    };
  }, [pathname]);

  return null;
}