"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

import {
  mediaPathFromStorageKey,
  resolveMediaUrl,
} from "@/lib/media/api";

type MemberAvatarSize = "sm" | "md" | "xl";

const sizeClasses: Record<MemberAvatarSize, string> = {
  sm: "size-8 text-[0.65rem]",
  md: "size-10 text-xs",
  xl: "size-18 text-xl",
};

/**
 * `photo_url` admin dapat berisi storage key V2 (`images/...`), path media
 * lengkap, atau URL/path lama. Storage key dinormalkan lewat
 * `mediaPathFromStorageKey`; nilai lama ditampilkan apa adanya lewat
 * `resolveMediaUrl`.
 */
export function resolveMemberPhotoUrl(
  photoUrl: string | null | undefined,
): string | null {
  if (!photoUrl) return null;

  const value = photoUrl.trim();

  if (!value) return null;

  if (value.startsWith("images/") || value.startsWith("api/v1/media/")) {
    return resolveMediaUrl(mediaPathFromStorageKey(value));
  }

  return resolveMediaUrl(value);
}

export function memberInitials(name: string): string {
  return (
    name
      .replace(/^(Dr|Ir)\. /, "")
      .replace(/[^A-Za-z .]/g, "")
      .split(/[ .]/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "?"
  );
}

interface MemberAvatarProps {
  name: string;
  photoUrl: string | null;
  size?: MemberAvatarSize;
  alt?: string;
}

export default function MemberAvatar({
  name,
  photoUrl,
  size = "md",
  alt = "",
}: MemberAvatarProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const resolvedUrl = resolveMemberPhotoUrl(photoUrl);
  const showImage = resolvedUrl !== null && failedUrl !== resolvedUrl;

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-green-800 font-bold text-white",
        sizeClasses[size],
      ].join(" ")}
    >
      {showImage ? (
        <img
          src={resolvedUrl ?? undefined}
          alt={alt}
          className="size-full object-cover"
          onError={() => setFailedUrl(resolvedUrl)}
        />
      ) : (
        <span aria-hidden={alt ? undefined : true}>
          {memberInitials(name)}
        </span>
      )}
    </span>
  );
}