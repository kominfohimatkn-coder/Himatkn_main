import type { ComponentProps } from "react";

export type TextareaProps = ComponentProps<"textarea"> & {
  invalid?: boolean;
};

const textareaBaseClasses =
  "min-h-28 w-full resize-y rounded-[3px] border border-paper-line bg-bg-light px-3 py-2.5 text-sm leading-6 text-ink outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-soft/75 hover:border-gold/60 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:border-paper-line disabled:bg-bg-light-2 disabled:text-ink-soft disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger/20";

export function Textarea({
  invalid = false,
  rows = 4,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      rows={rows}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={[textareaBaseClasses, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
