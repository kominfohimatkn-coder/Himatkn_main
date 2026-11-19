import Link from "next/link";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "dark"
  | "light"
  | "danger";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-gold bg-gold text-bg-dark hover:border-gold-soft hover:bg-gold-soft",
  secondary:
    "border-on-dark/25 bg-transparent text-on-dark hover:border-on-dark/50 hover:bg-on-dark/5",
  outline:
    "border-paper-line bg-transparent text-ink hover:border-gold hover:bg-bg-light-2",
  dark:
    "border-bg-dark bg-bg-dark text-on-dark hover:border-bg-dark-2 hover:bg-bg-dark-2",
  light:
    "border-paper-line bg-paper text-ink hover:border-gold hover:bg-bg-light-2",
  danger:
    "border-danger bg-danger text-white hover:border-danger/85 hover:bg-danger/85",
};

type SharedButtonProps = {
  variant?: ButtonVariant;
};

export function buttonClassName({
  variant = "primary",
  className = "",
}: SharedButtonProps & { className?: string } = {}) {
  return [
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-[3px] border px-4 font-sans text-xs font-bold tracking-[0.01em] transition-[background-color,border-color,color,transform] duration-200 hover:-translate-y-px disabled:pointer-events-none disabled:opacity-60",
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ComponentPropsWithoutRef<"button"> & SharedButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, className })}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ComponentProps<typeof Link> & SharedButtonProps) {
  return (
    <Link className={buttonClassName({ variant, className })} {...props} />
  );
}
