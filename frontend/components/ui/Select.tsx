import type { ComponentProps } from "react";

export type SelectProps = ComponentProps<"select"> & {
  invalid?: boolean;
  placeholder?: string;
};

const selectBaseClasses =
  "min-h-11 w-full appearance-none rounded-[3px] border border-paper-line bg-bg-light px-3 py-2 pr-9 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-200 hover:border-gold/60 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20 disabled:cursor-not-allowed disabled:border-paper-line disabled:bg-bg-light-2 disabled:text-ink-soft disabled:opacity-60 aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger/20";

export function Select({
  invalid = false,
  placeholder,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <span className="relative block">
      <select
        {...props}
        aria-invalid={invalid || props["aria-invalid"] || undefined}
        className={[selectBaseClasses, className]
          .filter(Boolean)
          .join(" ")}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}

        {children}
      </select>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-soft"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
