import Link from "next/link";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";

/**
 * Tombol publik mengikuti Prototype V1 (`Design/assets/style.css`):
 * huruf kapital 12px, padding 15px 22px, radius 4px.
 * Komponen `ui/Button` lama tetap dipakai admin dan halaman /struktur (R2),
 * jadi varian prototipe dipisah di sini agar tidak mengubah tampilan itu.
 */
export type PublicButtonTone = "solid" | "white" | "outline" | "outlineWhite";

const toneClasses: Record<PublicButtonTone, string> = {
  solid:
    "border-green-800 bg-green-800 text-white hover:border-green-700 hover:bg-green-700",
  white: "border-white bg-white text-green-900 hover:border-mint hover:bg-mint",
  outline:
    "border-[#C9D4CE] bg-white text-green-900 hover:border-green-800",
  outlineWhite:
    "border-white/55 bg-transparent text-white hover:border-white hover:bg-white/10",
};

const baseClasses =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[4px] border px-[22px] py-[15px] text-xs font-semibold tracking-[0.08em] uppercase transition-colors";

type ToneProps = {
  tone?: PublicButtonTone;
};

export function publicButtonClassName({
  tone = "solid",
  className = "",
}: ToneProps & { className?: string } = {}) {
  return `${baseClasses} ${toneClasses[tone]} ${className}`.trim();
}

export function PublicButtonLink({
  tone = "solid",
  className = "",
  ...props
}: ComponentProps<typeof Link> & ToneProps & { className?: string }) {
  return (
    <Link className={publicButtonClassName({ tone, className })} {...props} />
  );
}

export function PublicButton({
  tone = "solid",
  className = "",
  type = "button",
  ...props
}: ComponentPropsWithoutRef<"button"> & ToneProps & { className?: string }) {
  return (
    <button
      type={type}
      className={publicButtonClassName({ tone, className })}
      {...props}
    />
  );
}

/** Link keluar situs memakai <a>, bukan next/link. */
export function PublicButtonAnchor({
  tone = "solid",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"a"> & ToneProps & { className?: string }) {
  return (
    <a className={publicButtonClassName({ tone, className })} {...props} />
  );
}
