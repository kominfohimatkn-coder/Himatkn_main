import type { ComponentProps } from "react";

export type SelectProps = ComponentProps<"select"> & {
  invalid?: boolean;
  placeholder?: string;
};

const selectBaseClasses =
  "min-h-10 appearance-none px-3 py-2.5 pr-8 w-full rounded-[4px] border border-line bg-white text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] disabled:cursor-not-allowed disabled:bg-mint-50 disabled:text-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:shadow-[0_0_0_3px_rgba(163,58,34,0.08)]";

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
        className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}