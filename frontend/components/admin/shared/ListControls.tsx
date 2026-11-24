import type { ComponentProps, ReactNode } from "react";

import { SelectMenu, type SelectMenuOption } from "@/components/ui/SelectMenu";

/**
 * Baris filter di atas tabel, mengikuti `.toolbar` di Design/admin.
 * Di ponsel (`.m-toolbar`): cari selebar penuh → select berdampingan
 * (satu select: beri `max-[640px]:col-span-2`) → filter status di paling bawah.
 */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3.5 max-[640px]:grid max-[640px]:grid-cols-2 max-[640px]:gap-2 max-[640px]:p-3">
      {children}
    </div>
  );
}

/** Kolom cari dengan ikon kaca pembesar (`.search`). */
export function SearchInput(props: ComponentProps<"input">) {
  return (
    <div className="relative max-w-[360px] flex-[1_1_240px] max-[640px]:col-span-2 max-[640px]:max-w-none">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className="pointer-events-none absolute top-1/2 left-3 size-[15px] -translate-y-1/2 text-muted"
      >
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4.5 4.5" />
      </svg>
      <input
        type="search"
        {...props}
        className="h-9 w-full rounded-[4px] border border-line bg-mint-50 pr-3 pl-9 text-sm text-ink outline-none placeholder:text-muted-light focus-visible:border-green-800 focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)]"
      />
    </div>
  );
}

/**
 * Tombol pilihan bersegmen (`.seg`), misalnya filter status.
 * Di ponsel tidak terlipat: satu baris yang bisa digeser ke samping.
 */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; count?: number }[];
  onChange: (value: T) => void;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex max-w-full flex-wrap gap-0.5 rounded-[4px] border border-line bg-mint-50 p-[3px] max-[640px]:order-last max-[640px]:col-span-2 max-[640px]:flex max-[640px]:flex-nowrap max-[640px]:overflow-x-auto max-[640px]:[scrollbar-width:none]"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className="h-[30px] shrink-0 cursor-pointer rounded-[3px] px-3 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase transition-colors hover:text-green-900 aria-pressed:bg-green-800 aria-pressed:text-white"
        >
          {option.label}
          {option.count !== undefined ? (
            <span className="ml-1 font-medium opacity-70">{option.count}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}

/**
 * Filter dropdown kecil di toolbar (`.select-sm`), memakai `SelectMenu`
 * ukuran `sm` agar tampilannya sama dengan dropdown lain di admin.
 */
export function SelectSm<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
  className = "",
}: {
  /** Nama filter untuk pembaca layar, mis. "Divisi". */
  label: string;
  value: T;
  options: SelectMenuOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  /** Mis. `max-[640px]:col-span-2` bila hanya satu filter di baris ponsel. */
  className?: string;
}) {
  return (
    <SelectMenu
      size="sm"
      label={label}
      hideLabel
      value={value}
      options={options}
      onChange={onChange}
      disabled={disabled}
      className={`min-w-[180px] max-[640px]:min-w-0 ${className}`.trim()}
    />
  );
}