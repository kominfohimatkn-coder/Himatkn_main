import type { ComponentProps, ReactNode } from "react";

/**
 * Tabel admin, mengikuti `.table` + `.table--cards` di Design/admin.
 * Di layar ≤640px setiap baris menjadi kartu dan label kolom (`label`)
 * tampil di atas isinya.
 */
export function Table({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse max-[640px]:block">
        <thead className="max-[640px]:hidden">
          <tr>{head}</tr>
        </thead>
        <tbody className="max-[640px]:block">{children}</tbody>
      </table>
    </div>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <th
      className={`border-b border-line bg-mint-50 px-4 py-[11px] text-left text-[11px] font-semibold tracking-[0.1em] whitespace-nowrap text-muted uppercase ${className}`.trim()}
    >
      {children}
    </th>
  );
}

export function Tr({ className = "", ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={`transition-colors hover:bg-[#f7faf8] max-[640px]:block max-[640px]:border-b max-[640px]:border-line max-[640px]:px-3.5 max-[640px]:py-3 [&:last-child>td]:border-b-0 ${className}`.trim()}
      {...props}
    />
  );
}

export function Td({
  label,
  actions = false,
  className = "",
  children,
}: {
  /** Label kolom yang tampil di mode kartu (≤640px). */
  label?: string;
  /** Kolom aksi: rata kanan di desktop, rata kiri di mode kartu. */
  actions?: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <td
      data-label={label}
      className={[
        "border-b border-line px-4 py-[13px] align-middle max-[640px]:block max-[640px]:w-full max-[640px]:border-0 max-[640px]:px-0 max-[640px]:py-[3px]",
        label
          ? "max-[640px]:before:block max-[640px]:before:text-[11px] max-[640px]:before:font-semibold max-[640px]:before:tracking-[0.1em] max-[640px]:before:text-muted-light max-[640px]:before:uppercase max-[640px]:before:content-[attr(data-label)]"
          : "",
        actions ? "text-right whitespace-nowrap max-[640px]:pt-2 max-[640px]:text-left" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </td>
  );
}

/** Kaki tabel + nomor halaman, mengikuti `pager()` di Design/admin. */
export function Pager({
  total,
  page,
  perPage,
  onPage,
}: {
  total: number;
  page: number;
  perPage: number;
  onPage: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  let nums: (number | "gap")[] = Array.from({ length: pages }, (_, i) => i + 1);

  if (pages > 7) {
    const keep = [...new Set([1, 2, page - 1, page, page + 1, pages - 1, pages])]
      .filter((n) => n >= 1 && n <= pages)
      .sort((a, b) => a - b);
    nums = keep.flatMap((n, i) => (i && n - keep[i - 1] > 1 ? ["gap" as const, n] : [n]));
  }

  const button =
    "min-w-[30px] h-[30px] cursor-pointer rounded-[3px] border border-line bg-white px-1.5 text-xs hover:border-green-800 disabled:pointer-events-none disabled:opacity-40 aria-[current=true]:border-green-800 aria-[current=true]:bg-green-800 aria-[current=true]:text-white";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-muted">
      <span>
        Menampilkan {total ? (page - 1) * perPage + 1 : 0}–{Math.min(total, page * perPage)} dari {total}
      </span>
      <nav aria-label="Halaman" className="flex gap-1">
        <button type="button" className={button} disabled={page === 1} onClick={() => onPage(page - 1)} aria-label="Sebelumnya">
          ‹
        </button>
        {nums.map((n, i) =>
          n === "gap" ? (
            <span key={`gap-${i}`} className="self-center px-1">
              …
            </span>
          ) : (
            <button
              key={n}
              type="button"
              className={button}
              aria-current={n === page ? "true" : undefined}
              aria-label={`Halaman ${n}`}
              onClick={() => onPage(n)}
            >
              {n}
            </button>
          ),
        )}
        <button type="button" className={button} disabled={page === pages} onClick={() => onPage(page + 1)} aria-label="Berikutnya">
          ›
        </button>
      </nav>
    </div>
  );
}