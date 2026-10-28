"use client";

/* eslint-disable @next/next/no-img-element */

import { Image as ImageIcon } from "lucide-react";
import { useState } from "react";

import { resolveMediaUrl } from "@/lib/api/media";

type PublicImageProps = {
  src: string | null;
  alt: string;
  className?: string;
};

function ImageContent({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return <ImageFallback />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className="h-full w-full object-cover"
    />
  );
}

function ImageFallback() {
  return (
    <div
      className="flex h-full min-h-24 w-full items-center justify-center text-ink/30"
      aria-hidden="true"
    >
      <ImageIcon className="h-8 w-8" />
    </div>
  );
}

export function PublicImage({
  src,
  alt,
  className = "",
}: PublicImageProps) {
  const resolvedUrl = resolveMediaUrl(src);

  return (
    <div
      className={`relative overflow-hidden bg-cream-2 ${className}`.trim()}
    >
      {resolvedUrl ? (
        <ImageContent key={resolvedUrl} src={resolvedUrl} alt={alt} />
      ) : (
        <ImageFallback />
      )}
    </div>
  );
}
