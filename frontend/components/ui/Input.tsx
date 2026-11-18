import type { ComponentProps } from "react";

export type InputProps = ComponentProps<"input"> & {
  invalid?: boolean;
};

const inputBaseClasses =
  "min-h-11 w-full rounded-[3px] border border-paper-line bg-bg-light px-3 py-2 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-soft/75 hover:border-gold/60 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:border-paper-line disabled:bg-bg-light-2 disabled:text-ink-soft disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger/20";

export function Input({
  invalid = false,
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={[inputBaseClasses, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
