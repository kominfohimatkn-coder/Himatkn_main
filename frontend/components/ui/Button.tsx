import Link from "next/link";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";

/**
 * Tombol admin mengikuti `.btn` di Design/admin/assets/admin.css.
 * Nama varian lama tetap didukung agar halaman yang belum dirombak tidak rusak:
 * primary → solid, secondary → ghost, light → outline, dark → solid gelap.
 */
export type ButtonVariant =
  | "solid"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-outline"
  | "primary"
  | "secondary"
  | "dark"
  | "light";

export type ButtonSize = "md" | "sm" | "xs" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  solid: "border-transparent bg-green-800 text-white hover:bg-green-700",
  primary: "border-transparent bg-green-800 text-white hover:bg-green-700",
  dark: "border-transparent bg-green-950 text-white hover:bg-green-900",
  outline:
    "border-line-strong bg-white text-green-900 hover:border-green-800",
  light:
    "border-line-strong bg-white text-green-900 hover:border-green-800",
  ghost:
    "border-transparent bg-transparent text-muted hover:bg-mint-50 hover:text-green-900",
  secondary:
    "border-transparent bg-transparent text-muted hover:bg-mint-50 hover:text-green-900",
  danger: "border-transparent bg-danger text-white hover:bg-[#8a2f1b]",
  "danger-outline":
    "border-[#e6cfc6] bg-white text-danger hover:border-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-[38px] text-[11.5px] tracking-[0.08em]",
  sm: "h-8 text-[11px] tracking-[0.08em]",
  xs: "h-7 text-[11px] tracking-[0.06em]",
  icon: "size-[34px] text-[11px]",
};

/** Padding dipisah agar `.btn--ghost` (10px) tidak bertabrakan dengan padding ukuran. */
function paddingClass(variant: ButtonVariant, size: ButtonSize): string {
  if (size === "icon") return "px-0";
  if (variant === "ghost" || variant === "secondary") return "px-2.5";
  if (size === "sm") return "px-[11px]";
  if (size === "xs") return "px-[9px]";
  return "px-4";
}

type SharedButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function buttonClassName({
  variant = "solid",
  size = "md",
  className = "",
}: SharedButtonProps & { className?: string } = {}) {
  return [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[4px] border font-sans leading-none font-semibold whitespace-nowrap uppercase transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-[15px] [&_svg]:shrink-0",
    sizeClasses[size],
    paddingClass(variant, size),
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "solid",
  size = "md",
  className,
  type = "button",
  ...props
}: ComponentPropsWithoutRef<"button"> & SharedButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & SharedButtonProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}