"use client";

/** Tab sederhana, mengikuti `.tabs` di Design/admin. */
export function Tabs<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="mb-4 flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]"
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={`relative cursor-pointer px-3.5 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-colors hover:text-green-900 ${
              selected
                ? "text-green-900 after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-green-800"
                : "text-muted"
            }`}
          >
            {option.label}
            {option.count !== undefined ? (
              <span className="ml-1 font-medium text-muted-light">{option.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}