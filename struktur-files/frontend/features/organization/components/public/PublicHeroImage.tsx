"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

import { resolveMediaUrl } from "@/lib/media/api";

const STATIC_HERO_IMAGE = "/images/hero-group.jpg";

type PublicHeroImageProps = {
  /** Nilai `hero_image` dari settings; boleh storage key, path media, atau URL. */
  src: string | null;
  alt: string;
  className?: string;
};

/**
 * Foto hero memakai `<img>` karena URL media backend berasal dari origin API
 * yang tidak terdaftar di `next/image`. Bila gambar setting gagal dimuat,
 * komponen jatuh ke aset statis yang sudah ada.
 */
export function PublicHeroImage({
  src,
  alt,
  className = "",
}: PublicHeroImageProps) {
  const [currentSrc, setCurrentSrc] = useState(
    () => resolveMediaUrl(src) ?? STATIC_HERO_IMAGE,
  );

  return (
    <img
      src={currentSrc}
      alt={alt}
      fetchPriority="high"
      onError={() => setCurrentSrc(STATIC_HERO_IMAGE)}
      className={className}
    />
  );
}
