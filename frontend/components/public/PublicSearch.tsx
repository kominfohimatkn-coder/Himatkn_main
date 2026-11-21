"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

type PublicSearchProps = {
  /** Nilai awal dari `searchParams` di server. */
  initialValue?: string;
  placeholder: string;
  /** Label tersembunyi untuk input. */
  label: string;
  /** Parameter query yang dipertahankan saat kata kunci berubah. */
  preserve?: string[];
};

/**
 * Input pencarian mengikuti `.search` pada prototype: debounce 250 ms,
 * `router.replace` yang memperbarui `?q=`, tombol "Hapus", dan spinner saat
 * transisi. Hanya bagian ini yang menjadi Client Component.
 */
export function PublicSearch({
  initialValue = "",
  placeholder,
  label,
  preserve = [],
}: PublicSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const [previousInitial, setPreviousInitial] = useState(initialValue);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ikuti perubahan dari server (mis. tombol kembali browser) tanpa effect:
  // state disesuaikan saat render ketika nilai awal benar-benar berubah.
  if (initialValue !== previousInitial) {
    setPreviousInitial(initialValue);
    setValue(initialValue);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function navigate(nextValue: string) {
    const next = new URLSearchParams();

    for (const key of preserve) {
      const current = searchParams.get(key);
      if (current) next.set(key, current);
    }

    const term = nextValue.trim();
    if (term) next.set("q", term);

    const query = next.toString();

    startTransition(() => {
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    });
  }

  function schedule(nextValue: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => navigate(nextValue), 250);
  }

  function handleChange(nextValue: string) {
    setValue(nextValue);
    schedule(nextValue);
  }

  function handleClear() {
    if (timer.current) clearTimeout(timer.current);
    setValue("");
    navigate("");
    inputRef.current?.focus();
  }

  return (
    <form
      role="search"
      className="relative mx-auto mt-8 max-w-[560px]"
      onSubmit={(event) => {
        event.preventDefault();
        if (timer.current) clearTimeout(timer.current);
        navigate(value);
      }}
    >
      <label className="sr-only" htmlFor="public-search-q">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id="public-search-q"
        name="q"
        type="search"
        value={value}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="h-12 w-full rounded-[4px] border border-line bg-[#F7F9F8] py-[13px] pr-24 pl-10 text-sm text-ink transition-[border-color,box-shadow] focus:border-green-800 focus:shadow-[0_0_0_3px_rgba(15,77,54,0.12)] focus:outline-none"
      />
      <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
        {isPending ? (
          <span
            className="size-4 animate-spin rounded-full border-2 border-green-800/20 border-t-green-800"
            aria-hidden="true"
          />
        ) : null}
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase transition-colors hover:text-green-800"
          >
            Hapus
          </button>
        ) : null}
      </div>
    </form>
  );
}
