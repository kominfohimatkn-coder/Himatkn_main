"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
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
  className = "",
  triggerClassName = "",
}: {
  /** Label untuk pembaca layar dan (bila `hideLabel` false) tampil di atas. */
  label: string;
  hideLabel?: boolean;
  value: T;
  options: SelectMenuOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  className?: string;
  /** Kelas tambahan untuk tombol, mis. latar berbeda di halaman publik. */
  triggerClassName?: string;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const listId = `${id}-list`;
  const optionId = (index: number) => `${id}-opt-${index}`;

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selectedIndex = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const selected = options[selectedIndex];

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
    if (option.value !== value) onChange(option.value);
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
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${id}-value`}
        onClick={() => (open ? close() : openList())}
        onKeyDown={handleTriggerKeyDown}
        className={`flex w-full cursor-pointer items-center gap-3.5 rounded-[4px] border border-line-strong bg-white px-3.5 py-3 text-left transition-[background-color,border-color,box-shadow] hover:border-green-700 hover:bg-mint-50 disabled:cursor-not-allowed disabled:opacity-60 ${
          open ? "border-green-700 bg-mint-50 shadow-[0_0_0_3px_rgba(15,77,54,0.08)]" : ""
        } ${triggerClassName}`.trim()}
      >
        {selected?.icon ? <OptionIcon>{selected.icon}</OptionIcon> : null}
        <span id={`${id}-value`} className="grid min-w-0 flex-1 gap-0.5">
          <span className="truncate text-[15px] leading-[1.3] font-bold text-green-900">
            {selected?.label ?? "Pilih"}
          </span>
          {selected?.description ? (
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
          className="absolute inset-x-0 top-[calc(100%+6px)] z-40 grid max-h-[min(420px,65vh)] gap-1 overflow-y-auto rounded-[4px] border border-line bg-white p-1.5 text-left shadow-[0_18px_42px_rgba(6,38,27,0.14)] outline-none transition-[opacity,translate] duration-150 starting:-translate-y-1 starting:opacity-0"
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === active;

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