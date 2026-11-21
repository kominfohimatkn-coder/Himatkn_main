import type { ComponentProps } from "react";

export type InputProps = ComponentProps<"input"> & {
  invalid?: boolean;
};

const inputBaseClasses =
  "min-h-10 px-3 py-2.5 w-full rounded-[4px] border border-line bg-white text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] read-only:bg-mint-50 read-only:text-muted disabled:cursor-not-allowed disabled:bg-mint-50 disabled:text-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:shadow-[0_0_0_3px_rgba(163,58,34,0.08)]";

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