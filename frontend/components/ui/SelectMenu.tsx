"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type AriaAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SelectMenuOption<T extends string = string> {
  value: T;
  label: string;
  /** Baris kedua yang lebih kecil, mis. deskripsi atau "9 personil". */
  description?: ReactNode;
  icon?: ReactNode;
  /** Tanda kecil di kanan, mis. jumlah perubahan belum disimpan. */
  badge?: ReactNode;
}

type SelectMenuSize = "lg" | "md" | "sm";

/** `lg`: pemilih besar (Pengaturan, /struktur); `md`: kolom form; `sm`: filter toolbar. */
const TRIGGER_SIZES: Record<SelectMenuSize, string> = {
  lg: "gap-3.5 border-line-strong px-3.5 py-3 hover:border-green-700 hover:bg-mint-50",
  md: "min-h-10 gap-2.5 border-line px-3 py-2 text-sm hover:border-line-strong",
  sm: "h-9 gap-2 border-line px-3 text-sm hover:border-line-strong",
};

/**
 * Dropdown pilih-satu yang dipakai admin dan publik
 * (mengikuti `.section-select` di Design/admin, sudut 4px).
 *
 * Perilaku: klik atau ↓/↑/Enter/Spasi membuka daftar; ↑ ↓ Home End memindah
 * sorotan; ketik huruf untuk lompat; Enter/Spasi memilih; Escape atau klik di
 * luar menutup dan fokus kembali ke tombol. Tanpa ketergantungan ke kode admin.
 */
export function SelectMenu<T extends string>({
  label,
  hideLabel = false,
  value,
  options,
  onChange,
  disabled = false,
  size = "lg",
  placeholder = "Pilih",
  className = "",
  triggerClassName = "",
  id: triggerId,
  "aria-describedby": describedBy,
  "aria-invalid": invalid,
}: {
  /** Label untuk pembaca layar dan (bila `hideLabel` false) tampil di atas. */
  label: string;
  hideLabel?: boolean;
  value: T;
  options: SelectMenuOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  size?: SelectMenuSize;
  /** Teks tombol bila `value` tidak ada di `options`. */
  placeholder?: string;
  className?: string;
  /** Kelas tambahan untuk tombol, mis. latar berbeda di halaman publik. */
  triggerClassName?: string;
  /** Diisi `FormField` agar `<label htmlFor>`, petunjuk, dan galat terhubung. */
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
}) {
  const compact = size !== "lg";
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-opt-${index}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const foundIndex = options.findIndex((option) => option.value === value);
  const selected = foundIndex >= 0 ? options[foundIndex] : undefined;
  const selectedIndex = Math.max(0, foundIndex);

  /* Tutup saat klik/sentuh di luar. */
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  /* Fokus ke daftar saat terbuka; jaga opsi aktif tetap terlihat. */
  useEffect(() => {
    if (!open) return;
    listRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`${id}-opt-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [id, open, active]);

  function openList(index = selectedIndex) {
    if (disabled || options.length === 0) return;
    setActive(index);
    setOpen(true);
  }

  function close(restoreFocus = true) {
    setOpen(false);
    if (restoreFocus) triggerRef.current?.focus();
  }

  function choose(index: number) {
    const option = options[index];
    if (!option) return;
    close();
    if (option.value !== value || !selected) onChange(option.value);
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openList(
        event.key === "ArrowUp"
          ? Math.max(0, selectedIndex - 1)
          : event.key === "ArrowDown" && open
            ? Math.min(options.length - 1, selectedIndex + 1)
            : selectedIndex,
      );
    }
  }

  function handleListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const last = options.length - 1;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((index) => Math.min(last, index + 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((index) => Math.max(0, index - 1));
        break;
      case "Home":
        event.preventDefault();
        setActive(0);
        break;
      case "End":
        event.preventDefault();
        setActive(last);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        choose(active);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        close(false);
        break;
      default:
        /* Ketik huruf: lompat ke opsi berikutnya yang diawali huruf itu. */
        if (event.key.length === 1 && /\S/.test(event.key)) {
          const letter = event.key.toLocaleLowerCase("id-ID");
          const order = options.map((_, index) => (active + 1 + index) % options.length);
          const match = order.find((index) =>
            options[index].label.toLocaleLowerCase("id-ID").startsWith(letter),
          );
          if (match !== undefined) setActive(match);
        }
    }
  }

  return (
    <div ref={rootRef} className={`relative ${open ? "z-30" : ""} ${className}`.trim()}>
      <span
        id={labelId}
        className={
          hideLabel
            ? "sr-only"
            : "mb-2 block text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-muted uppercase"
        }
      >
        {label}
      </span>

      <button
        ref={triggerRef}
        id={triggerId}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${id}-value`}
        aria-describedby={describedBy}
        /* aria-invalid tidak berlaku untuk tombol; pesan galat tetap
           terbaca lewat aria-describedby dari FormField. */
        data-invalid={invalid === true || invalid === "true" ? "" : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={`flex w-full cursor-pointer items-center rounded-[4px] border bg-white text-left outline-none transition-[background-color,border-color,box-shadow] focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] disabled:cursor-not-allowed disabled:bg-mint-50 disabled:opacity-60 data-invalid:border-danger ${
          TRIGGER_SIZES[size]
        } ${
          open ? "border-green-700 shadow-[0_0_0_3px_rgba(15,77,54,0.08)]" : ""
        } ${open && !compact ? "bg-mint-50" : ""} ${triggerClassName}`.trim()}
      >
        {selected?.icon ? <OptionIcon>{selected.icon}</OptionIcon> : null}
        <span id={`${id}-value`} className="grid min-w-0 flex-1 gap-0.5">
          <span
            className={`truncate ${
              compact
                ? selected
                  ? "text-ink"
                  : "text-muted-light"
                : "text-[15px] leading-[1.3] font-bold text-green-900"
            }`}
          >
            {selected?.label ?? placeholder}
          </span>
          {selected?.description && !compact ? (
            <span className="truncate text-[12.5px] leading-[1.4] text-muted">
              {selected.description}
            </span>
          ) : null}
        </span>
        {selected?.badge}
        <ChevronDown
          aria-hidden="true"
          className={`size-4 shrink-0 text-muted transition-transform duration-200 ${
            open ? "rotate-180 text-green-900" : ""
          }`}
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-labelledby={labelId}
          aria-activedescendant={optionId(active)}
          onKeyDown={handleListKeyDown}
          className={`absolute inset-x-0 z-40 grid overflow-y-auto rounded-[4px] border border-line bg-white text-left shadow-[0_18px_42px_rgba(6,38,27,0.14)] outline-none transition-[opacity,translate] duration-150 starting:-translate-y-1 starting:opacity-0 ${
            compact
              ? "top-[calc(100%+4px)] max-h-[min(320px,55vh)] gap-0.5 p-1"
              : "top-[calc(100%+6px)] max-h-[min(420px,65vh)] gap-1 p-1.5"
          }`}
        >
          {options.map((option, index) => {
            const isSelected = selected !== undefined && index === selectedIndex;
            const isActive = index === active;

            if (compact) {
              return (
                <li
                  key={option.value}
                  id={optionId(index)}
                  role="option"
                  aria-selected={isSelected}
                  onPointerMove={() => setActive(index)}
                  onClick={() => choose(index)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-[3px] px-2.5 py-2 text-sm transition-colors ${
                    isActive ? "bg-mint-50" : ""
                  } ${isSelected ? "font-semibold text-green-900" : "text-ink"}`}
                >
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="wrap-anywhere">{option.label}</span>
                    {option.description ? (
                      <span className="text-xs font-normal text-muted">{option.description}</span>
                    ) : null}
                  </span>
                  {option.badge}
                  <Check
                    aria-hidden="true"
                    className={`size-4 shrink-0 text-green-800 ${isSelected ? "" : "invisible"}`}
                  />
                </li>
              );
            }

            return (
              <li
                key={option.value}
                id={optionId(index)}
                role="option"
                aria-selected={isSelected}
                onPointerMove={() => setActive(index)}
                onClick={() => choose(index)}
                className={`flex cursor-pointer items-center gap-3.5 rounded-[4px] border px-3 py-2.5 transition-colors ${
                  isSelected ? "border-[#9bb8ac] bg-mint-50" : "border-transparent"
                } ${isActive && !isSelected ? "bg-mint-50" : ""} ${
                  isActive ? "outline outline-1 -outline-offset-1 outline-green-700/40" : ""
                }`}
              >
                {option.icon ? <OptionIcon>{option.icon}</OptionIcon> : null}
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span
                    className={`text-[14.5px] leading-[1.3] font-bold ${
                      isSelected ? "text-green-800" : "text-green-900"
                    }`}
                  >
                    {option.label}
                  </span>
                  {option.description ? (
                    <span className="text-[12.5px] leading-[1.4] text-muted">{option.description}</span>
                  ) : null}
                </span>
                {option.badge}
                <span
                  aria-hidden="true"
                  className={`grid size-[22px] shrink-0 place-items-center rounded-full border-[1.5px] [&_svg]:size-3 ${
                    isSelected
                      ? "border-green-800 bg-green-800 text-white"
                      : "border-line-strong bg-white text-transparent"
                  }`}
                >
                  <Check />
                </span>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function OptionIcon({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden="true"
      className="grid size-10 shrink-0 place-items-center rounded-[4px] border border-line bg-white text-green-800 [&_svg]:size-[19px]"
    >
      {children}
    </span>
  );
}