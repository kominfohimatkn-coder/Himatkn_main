import type { ComponentProps } from "react";

export type TextareaProps = ComponentProps<"textarea"> & {
  invalid?: boolean;
};

const textareaBaseClasses =
  "min-h-[120px] resize-y px-3 py-2.5 leading-[1.6] w-full rounded-[4px] border border-line bg-white text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] read-only:bg-mint-50 read-only:text-muted disabled:cursor-not-allowed disabled:bg-mint-50 disabled:text-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:shadow-[0_0_0_3px_rgba(163,58,34,0.08)]";

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