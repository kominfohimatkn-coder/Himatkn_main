# ADM-2 Publikasi — kode salin-tempel

Basis: ADM-1 sudah terpasang. **Tidak ada package baru, tidak ada file yang dihapus.** Semua styling memakai class Tailwind v4; `globals.css` tidak disentuh.

Semua path relatif dari folder `frontend/`. Path berkurung seperti `(private)` dan `[id]` adalah nama folder sungguhan.

## Urutan
1. **Bagian A:** buat 11 file baru (buat foldernya bila belum ada: `app/(private)/(admin)/admin/news/new` dan `app/(private)/(admin)/admin/news/[id]`).
2. **Bagian B:** ganti **seluruh isi** 7 file.
3. Dari folder `frontend`: `npm run lint`, `npx tsc --noEmit`, `npm run build`.
4. Cek di browser (daftar di akhir file), lalu commit.

## Bagian A — File baru

### A1. `lib/markdown.tsx`
_renderer Markdown kecil (tanpa package, tanpa innerHTML)_

```tsx
import type { ReactNode } from "react";

/**
 * Renderer Markdown kecil untuk isi publikasi, mengikuti `md()` di
 * Design/admin/assets/admin.js. Hasilnya elemen React biasa (tanpa
 * `dangerouslySetInnerHTML`), jadi HTML di dalam teks tidak pernah dieksekusi.
 *
 * Yang didukung:
 * - `## Subjudul`, `### Sub-subjudul` (juga `# ` → dianggap `##`)
 * - `- item` / `* item` dan `1. item`
 * - `> kutipan`
 * - `**tebal**`, `*miring*`, `_miring_`, `[teks](https://…)`
 * - Baris biasa yang berurutan digabung menjadi satu paragraf dengan
 *   pemisah baris, sehingga isi lama (teks polos) tetap tampil seperti dulu.
 */

type Block =
  | { type: "p"; lines: string[] }
  | { type: "h2" | "h3"; text: string }
  | { type: "ul" | "ol"; items: string[] }
  | { type: "quote"; lines: string[] };

export function parseMarkdown(source: string): Block[] {
  const blocks: Block[] = [];
  const lines = source.replace(/\r\n?/g, "\n").split("\n");

  for (const raw of lines) {
    const line = raw.trimEnd();
    const last = blocks[blocks.length - 1];

    if (!line.trim()) {
      blocks.push({ type: "p", lines: [] });
      continue;
    }

    const bullet = /^\s*[-*]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);

    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      const text = (bullet ?? numbered)![1];

      if (last && last.type === type) last.items.push(text);
      else blocks.push({ type, items: [text] });
      continue;
    }

    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({
        type: heading[1].length === 3 ? "h3" : "h2",
        text: heading[2],
      });
      continue;
    }

    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      if (last && last.type === "quote") last.lines.push(quote[1]);
      else blocks.push({ type: "quote", lines: [quote[1]] });
      continue;
    }

    if (last && last.type === "p" && last.lines.length > 0) {
      last.lines.push(line.trim());
    } else {
      blocks.push({ type: "p", lines: [line.trim()] });
    }
  }

  return blocks.filter((block) => block.type !== "p" || block.lines.length > 0);
}

/** Tebal, tautan, lalu miring (`*x*` atau `_x_`). */
const INLINE_PATTERN =
  /\*\*(.+?)\*\*|\[([^\]\n]+)\]\(((?:https?:\/\/|mailto:|\/(?!\/))[^\s)]*)\)|(?<![*\w])\*(?![\s*])(.+?)\*(?!\*)|(?<!\w)_(?!\s)(.+?)_(?!\w)/g;

type InlineClasses = { a: string; strong: string; em: string };

function renderInline(
  text: string,
  classes: InlineClasses,
  keyPrefix: string,
): ReactNode[] {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  for (const match of text.matchAll(INLINE_PATTERN)) {
    const start = match.index ?? 0;
    if (start > cursor) nodes.push(text.slice(cursor, start));

    const key = `${keyPrefix}-${index++}`;
    const [, bold, linkText, href, starItalic, underscoreItalic] = match;

    if (bold !== undefined) {
      nodes.push(
        <strong key={key} className={classes.strong}>
          {renderInline(bold, classes, key)}
        </strong>,
      );
    } else if (linkText !== undefined && href !== undefined) {
      const external = /^https?:\/\//.test(href);
      nodes.push(
        <a
          key={key}
          href={href}
          className={classes.a}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {renderInline(linkText, classes, key)}
        </a>,
      );
    } else {
      nodes.push(
        <em key={key} className={classes.em}>
          {renderInline(starItalic ?? underscoreItalic ?? "", classes, key)}
        </em>,
      );
    }

    cursor = start + match[0].length;
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}

type Variant = "admin" | "public";

const VARIANTS: Record<
  Variant,
  InlineClasses & {
    root: string;
    p: string;
    h2: string;
    h3: string;
    ul: string;
    ol: string;
    li: string;
    quote: string;
  }
> = {
  /** `.md-preview` di Design/admin/assets/admin.css. */
  admin: {
    root: "text-[15px] leading-[1.75] text-ink",
    p: "mb-3",
    h2: "mt-[18px] mb-2 font-serif text-[21px] leading-[1.3] font-bold text-green-900 first:mt-0",
    h3: "mt-4 mb-1.5 font-serif text-[17px] leading-[1.3] font-bold text-green-900 first:mt-0",
    ul: "mb-3 list-disc pl-[22px]",
    ol: "mb-3 list-decimal pl-[22px]",
    li: "",
    quote: "my-3 border-l-[3px] border-green-700 pl-3.5 text-muted italic",
    a: "text-green-800 underline underline-offset-2",
    strong: "font-semibold",
    em: "italic",
  },
  /** `.article__body` di Design/assets/style.css. */
  public: {
    root: "",
    p: "mb-5 text-[17px] leading-[1.8] text-[#2A3530]",
    h2: "mt-10 mb-4 font-serif text-[26px] leading-[1.3] font-bold text-green-900 first:mt-0",
    h3: "mt-8 mb-3 font-serif text-[21px] leading-[1.3] font-bold text-green-900 first:mt-0",
    ul: "mb-5 list-disc pl-6 text-[17px] leading-[1.8] text-[#2A3530] marker:text-green-700",
    ol: "mb-5 list-decimal pl-6 text-[17px] leading-[1.8] text-[#2A3530] marker:text-green-700",
    li: "mb-1.5",
    quote:
      "my-7 border-l-[3px] border-green-700 pl-5 text-[17px] leading-[1.8] text-muted italic",
    a: "text-green-800 underline underline-offset-2 hover:text-green-950",
    strong: "font-semibold text-green-900",
    em: "italic",
  },
};

export function Markdown({
  source,
  variant = "public",
  empty = null,
}: {
  source: string | null | undefined;
  variant?: Variant;
  /** Ditampilkan bila isi kosong. */
  empty?: ReactNode;
}) {
  const blocks = source ? parseMarkdown(source) : [];
  if (blocks.length === 0) return <>{empty}</>;

  const c = VARIANTS[variant];

  return (
    <div className={c.root || undefined}>
      {blocks.map((block, i) => {
        const key = `b${i}`;

        switch (block.type) {
          case "h2":
            return (
              <h2 key={key} className={c.h2}>
                {renderInline(block.text, c, key)}
              </h2>
            );
          case "h3":
            return (
              <h3 key={key} className={c.h3}>
                {renderInline(block.text, c, key)}
              </h3>
            );
          case "ul":
          case "ol": {
            const List = block.type;
            return (
              <List key={key} className={c[block.type]}>
                {block.items.map((item, j) => (
                  <li key={`${key}-${j}`} className={c.li || undefined}>
                    {renderInline(item, c, `${key}-${j}`)}
                  </li>
                ))}
              </List>
            );
          }
          case "quote":
            return (
              <blockquote key={key} className={c.quote}>
                {withBreaks(block.lines, c, key)}
              </blockquote>
            );
          default:
            return (
              <p key={key} className={c.p}>
                {withBreaks(block.lines, c, key)}
              </p>
            );
        }
      })}
    </div>
  );
}

function withBreaks(lines: string[], c: InlineClasses, key: string) {
  return lines.flatMap((line, j) => [
    ...(j > 0 ? [<br key={`${key}-br${j}`} />] : []),
    ...renderInline(line, c, `${key}-${j}`),
  ]);
}
```

### A2. `components/admin/shared/Toast.tsx`
_notifikasi kanan atas_

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { Check, TriangleAlert } from "lucide-react";

type ToastType = "ok" | "error";
type ToastItem = { id: number; message: string; type: ToastType };

const ToastContext = createContext<(message: string, type?: ToastType) => void>(
  () => {},
);

/** Notifikasi singkat di kanan atas, mengikuti `.toasts` + `toast()` di Design/admin. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = "ok") => {
    const id = Date.now() + Math.random();
    setItems((current) => [...current, { id, message, type }]);
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        aria-live="polite"
        className="fixed top-[76px] right-5 z-80 grid gap-2 max-[640px]:top-[72px] max-[640px]:right-3 max-[640px]:left-3"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role={item.type === "error" ? "alert" : "status"}
            className={`flex max-w-[380px] min-w-[260px] items-center gap-2.5 rounded-[6px] px-3.5 py-3 text-[13px] text-white shadow-[0_14px_34px_rgba(6,38,27,0.25)] transition duration-300 starting:-translate-y-2 starting:opacity-0 max-[640px]:max-w-none [&_svg]:size-[18px] [&_svg]:shrink-0 ${
              item.type === "error"
                ? "bg-[#4a1a10] [&_svg]:text-[#f2b8a8]"
                : "bg-green-950 [&_svg]:text-mint"
            }`}
          >
            {item.type === "error" ? (
              <TriangleAlert aria-hidden="true" />
            ) : (
              <Check aria-hidden="true" />
            )}
            <span>{item.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
```

### A3. `components/admin/shared/DataTable.tsx`
_Table/Th/Tr/Td + Pager, jadi kartu di ≤640px_

```tsx
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
```

### A4. `components/admin/shared/ListControls.tsx`
_Toolbar, SearchInput, Segmented, SelectSm_

```tsx
import type { ComponentProps, ReactNode } from "react";

/** Baris filter di atas tabel, mengikuti `.toolbar` di Design/admin. */
export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-4 py-3.5 max-[640px]:p-3">
      {children}
    </div>
  );
}

/** Kolom cari dengan ikon kaca pembesar (`.search`). */
export function SearchInput(props: ComponentProps<"input">) {
  return (
    <div className="relative max-w-[360px] flex-[1_1_240px] max-[640px]:max-w-none">
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

/** Tombol pilihan bersegmen (`.seg`), misalnya filter status. */
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
      className="inline-flex flex-wrap gap-0.5 rounded-[4px] border border-line bg-mint-50 p-[3px]"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
          className="h-[30px] cursor-pointer rounded-[3px] px-3 text-[11px] font-semibold tracking-[0.08em] text-muted uppercase transition-colors hover:text-green-900 aria-pressed:bg-green-800 aria-pressed:text-white"
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

/** Select kecil di toolbar (`.select-sm`). */
export function SelectSm({ children, ...props }: ComponentProps<"select">) {
  return (
    <span className="relative inline-block">
      <select
        {...props}
        className="h-9 cursor-pointer appearance-none rounded-[4px] border border-line bg-white pr-[30px] pl-3 text-sm text-ink outline-none focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)]"
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 10 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="pointer-events-none absolute top-1/2 right-[11px] h-1.5 w-2.5 -translate-y-1/2 text-muted"
      >
        <path d="m1 1 4 4 4-4" />
      </svg>
    </span>
  );
}
```

### A5. `components/admin/shared/Notice.tsx`
_kotak pemberitahuan (mode lihat saja)_

```tsx
import type { ReactNode } from "react";

const tones = {
  default: "border-line bg-mint-50 text-green-900 [&_svg]:text-green-700",
  amber: "border-[#ebd9b4] bg-amber-bg text-[#5c4410] [&_svg]:text-amber",
};

/** Kotak pemberitahuan, mengikuti `.notice` di Design/admin. */
export function Notice({
  icon,
  tone = "default",
  className = "",
  children,
}: {
  icon: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-[4px] border px-3.5 py-3 text-[13px] [&_svg]:mt-px [&_svg]:size-[17px] [&_svg]:shrink-0 ${tones[tone]} ${className}`.trim()}
    >
      {icon}
      <div>{children}</div>
    </div>
  );
}
```

### A6. `features/news/status.ts`
_label & warna status publikasi_

```ts
import type { BadgeTone } from "@/components/admin/shared/Badge";

import type { NewsStatus } from "./types";

/** `NEWS_STATUS` di Design/admin/assets/admin.js. */
export const NEWS_STATUS: Record<NewsStatus, { label: string; tone: BadgeTone }> = {
  published: { label: "Terbit", tone: "green" },
  draft: { label: "Draft", tone: "amber" },
  archived: { label: "Arsip", tone: "grey" },
};
```

### A7. `features/news/components/admin/NewsContentField.tsx`
_toolbar Markdown + tab Tulis/Pratinjau_

```tsx
"use client";

import { Link2 } from "lucide-react";
import { useRef, useState } from "react";

import { Markdown } from "@/lib/markdown";

/** Tombol format: `pre|post`; `line` berarti disisipkan di awal baris. */
const TOOLS = [
  { md: "**|**", label: "Tebal", icon: <b>B</b> },
  { md: "*|*", label: "Miring", icon: <i className="font-serif">I</i> },
  "sep",
  { md: "## |", label: "Subjudul", icon: "H2", line: true },
  { md: "- |", label: "Daftar berpoin", icon: "•", line: true },
  { md: "1. |", label: "Daftar bernomor", icon: "1.", line: true },
  { md: "> |", label: "Kutipan", icon: "❝", line: true },
  "sep",
  { md: "[|](https://)", label: "Tautan", icon: <Link2 className="size-[15px]" /> },
] as const;

/**
 * Isi publikasi: toolbar Markdown, tab Tulis/Pratinjau, textarea.
 * Mengikuti `.editor-tabs`, `.editor-bar`, `.md-preview` di Design/admin.
 */
export function NewsContentField({
  value,
  onChange,
  readOnly,
  error,
}: {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  error?: string;
}) {
  const [mode, setMode] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function applyTool(md: string, line: boolean) {
    const ta = textareaRef.current;
    if (!ta) return;

    const [pre, post] = md.split("|");
    const start = ta.selectionStart;
    const end = ta.selectionEnd;

    if (line) {
      const lineStart = ta.value.lastIndexOf("\n", start - 1) + 1;
      ta.setRangeText(pre, lineStart, lineStart, "end");
    } else {
      const word = ta.value.slice(start, end) || "teks";
      ta.setRangeText(pre + word + post, start, end, "end");
      ta.setSelectionRange(start + pre.length, start + pre.length + word.length);
    }

    ta.focus();
    onChange(ta.value);
  }

  const tabClass =
    "cursor-pointer rounded-t-[4px] border border-b-0 border-transparent px-3 py-1.5 text-xs font-semibold text-muted aria-selected:border-line aria-selected:bg-mint-50 aria-selected:text-green-900";

  return (
    <div className="mt-4 grid">
      <div className="mb-1.5 flex flex-wrap items-end gap-2">
        <span
          id="news-content-label"
          className="pb-1.5 text-[11px] font-semibold tracking-[0.08em] text-green-900 uppercase"
        >
          Isi publikasi{" "}
          <span aria-hidden="true" className="text-danger">
            *
          </span>
        </span>
        <span className="flex-1" />
        <div role="tablist" aria-label="Mode isi" className="flex gap-0.5">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "write"}
            className={tabClass}
            onClick={() => setMode("write")}
          >
            Tulis
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "preview"}
            className={tabClass}
            onClick={() => setMode("preview")}
          >
            Pratinjau
          </button>
        </div>
      </div>

      {mode === "write" ? (
        <div>
          {!readOnly ? (
            <div
              role="toolbar"
              aria-label="Format teks"
              className="flex flex-wrap gap-0.5 rounded-t-[4px] border border-b-0 border-line bg-mint-50 p-[5px]"
            >
              {TOOLS.map((tool, i) =>
                tool === "sep" ? (
                  <span key={`sep-${i}`} className="mx-1 my-1 w-px bg-line" />
                ) : (
                  <button
                    key={tool.label}
                    type="button"
                    title={tool.label}
                    aria-label={tool.label}
                    onClick={() => applyTool(tool.md, "line" in tool)}
                    className="grid h-7 w-[30px] cursor-pointer place-items-center rounded-[3px] text-[13px] font-bold text-muted hover:bg-white hover:text-green-900"
                  >
                    {tool.icon}
                  </button>
                ),
              )}
            </div>
          ) : null}
          <textarea
            ref={textareaRef}
            name="content"
            aria-labelledby="news-content-label"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "news-content-error" : undefined}
            readOnly={readOnly}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Tulis isi publikasi… Gunakan **tebal**, *miring*, ## subjudul, atau - daftar."
            className={`block min-h-[340px] w-full resize-y border border-line bg-white px-3 py-2.5 text-[15px] leading-[1.6] text-ink outline-none placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] read-only:bg-mint-50 read-only:text-muted aria-invalid:border-danger ${
              readOnly ? "rounded-[4px]" : "rounded-b-[4px]"
            }`}
          />
          {!readOnly ? (
            <p className="mt-1.5 text-xs text-muted">
              Format Markdown. Lihat hasilnya di tab Pratinjau.
            </p>
          ) : null}
        </div>
      ) : (
        <div className="min-h-[340px] rounded-[4px] border border-line bg-white px-5 py-[18px]">
          <Markdown
            source={value}
            variant="admin"
            empty={<p className="text-muted">Belum ada isi.</p>}
          />
        </div>
      )}

      {error ? (
        <p id="news-content-error" role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

### A8. `features/news/components/admin/NewsGallery.tsx`
_galeri: unggah, urutkan, keterangan, hapus_

```tsx
"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImageIcon,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";

import { Card } from "@/components/admin/shared/Card";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { useToast } from "@/components/admin/shared/Toast";
import { Button } from "@/components/ui/Button";
import { resolveMediaUrl } from "@/lib/media/api";

import {
  deleteAdminNewsImage,
  updateAdminNewsImage,
  uploadAdminNewsImage,
} from "../../admin-api";
import type { NewsImage } from "../../types";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Pending = { key: string; preview: string };

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Galeri publikasi, mengikuti `renderGallery()` di Design/admin.
 * Gambar pertama = sampul. Setiap aksi langsung tersimpan lewat endpoint
 * gambar, terpisah dari tombol Simpan publikasi.
 */
export function NewsGallery({
  newsId,
  images,
  editable,
  onImagesChange,
  onSaveFirst,
}: {
  /** `null` untuk publikasi yang belum disimpan. */
  newsId: number | null;
  images: NewsImage[];
  editable: boolean;
  onImagesChange: (images: NewsImage[]) => void;
  onSaveFirst: () => void;
}) {
  const toast = useToast();
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [dropOver, setDropOver] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const head = (
    <span className="text-xs text-muted">{images.length} gambar</span>
  );

  if (newsId === null) {
    return (
      <Card title="Galeri gambar" action={head}>
        <div className="rounded-[4px] border-[1.5px] border-dashed border-line-strong bg-mint-50 px-3 py-[18px] text-center">
          <ImageIcon aria-hidden="true" className="mx-auto mb-2 size-[26px] text-green-700" />
          <p className="mb-3 text-[13px] text-muted">
            <strong className="text-green-900">Simpan draft dulu untuk menambahkan gambar.</strong>
            <br />
            Gambar baru bisa diunggah setelah publikasi tersimpan.
          </p>
          {editable ? (
            <Button variant="outline" size="sm" onClick={onSaveFirst}>
              Simpan draft
            </Button>
          ) : null}
        </div>
      </Card>
    );
  }

  const id = newsId;

  async function upload(files: File[]) {
    const errors: string[] = [];

    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Format tidak didukung. Gunakan JPG, PNG, atau WebP.`);
        continue;
      }

      const item = { key: `${Date.now()}-${Math.random()}`, preview: URL.createObjectURL(file) };
      setPending((current) => [...current, item]);

      try {
        const current = imagesRef.current;
        const nextOrder = current.reduce((max, image) => Math.max(max, image.sort_order), -1) + 1;
        const saved = await uploadAdminNewsImage(id, file, { sort_order: nextOrder });
        imagesRef.current = [...imagesRef.current, saved];
        onImagesChange(imagesRef.current);
        toast("Gambar ditambahkan.");
      } catch (err) {
        errors.push(`${file.name}: ${errorMessage(err, "Gagal mengunggah.")}`);
      } finally {
        URL.revokeObjectURL(item.preview);
        setPending((current) => current.filter((p) => p.key !== item.key));
      }
    }

    setUploadErrors(errors);
  }

  async function reorder(from: number, to: number) {
    if (from === to || to < 0 || to >= images.length) return;

    const previous = images;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const renumbered = next.map((image, index) => ({ ...image, sort_order: index }));
    onImagesChange(renumbered);

    try {
      await Promise.all(
        renumbered
          .filter((image) => previous.find((p) => p.id === image.id)?.sort_order !== image.sort_order)
          .map((image) => updateAdminNewsImage(id, image.id, { sort_order: image.sort_order })),
      );
      toast(to === 0 ? "Urutan disimpan. Sampul diperbarui." : "Urutan gambar disimpan.");
    } catch (err) {
      onImagesChange(previous);
      toast(errorMessage(err, "Urutan gagal disimpan."), "error");
    }
  }

  async function saveCaption(image: NewsImage, caption: string) {
    if ((image.caption ?? "") === caption.trim()) return;

    try {
      const saved = await updateAdminNewsImage(id, image.id, { caption: caption.trim() });
      onImagesChange(images.map((item) => (item.id === image.id ? { ...item, caption: saved.caption } : item)));
      toast("Keterangan disimpan.");
    } catch (err) {
      toast(errorMessage(err, "Keterangan gagal disimpan."), "error");
    }
  }

  async function confirmRemove() {
    if (removing === null) return;
    const image = images[removing];
    setRemoveBusy(true);
    setRemoveError("");

    try {
      await deleteAdminNewsImage(id, image.id);
      onImagesChange(images.filter((item) => item.id !== image.id));
      setRemoving(null);
      toast("Gambar dihapus.");
    } catch (err) {
      setRemoveError(errorMessage(err, "Gambar gagal dihapus."));
    } finally {
      setRemoveBusy(false);
    }
  }

  function onDrop(event: DragEvent<HTMLLIElement>, to: number) {
    event.preventDefault();
    setDragOver(null);
    if (dragFrom !== null) void reorder(dragFrom, to);
    setDragFrom(null);
  }

  return (
    <Card title="Galeri gambar" action={head}>
      <p className="mb-2.5 text-xs text-muted">
        Gambar pertama dipakai sebagai sampul di situs.
        {editable ? " Seret atau pakai tombol panah untuk mengubah urutan." : ""}
      </p>

      {images.length || pending.length ? (
        <ol className="mb-3 grid list-none gap-2 p-0">
          {images.map((image, i) => (
            <li
              key={image.id}
              draggable={editable}
              onDragStart={(event) => {
                setDragFrom(i);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => {
                setDragFrom(null);
                setDragOver(null);
              }}
              onDragOver={(event) => {
                if (dragFrom === null) return;
                event.preventDefault();
                setDragOver(i);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(event) => onDrop(event, i)}
              className={`flex flex-wrap items-start gap-2.5 rounded-[4px] border bg-white p-2 transition ${
                dragOver === i && dragFrom !== i
                  ? "border-green-800 shadow-[0_0_0_2px_rgba(15,77,54,0.15)]"
                  : "border-line"
              } ${dragFrom === i ? "opacity-45" : ""}`}
            >
              {editable ? (
                <span aria-hidden="true" title="Seret untuk mengurutkan" className="cursor-grab pt-[22px] text-muted-light">
                  <GripVertical className="size-3.5" />
                </span>
              ) : null}
              <div className="relative grid aspect-[4/3] w-[84px] shrink-0 place-items-center overflow-hidden rounded-[3px] bg-[#dce5e0] text-muted max-[640px]:w-[72px]">
                {resolveMediaUrl(image.url) ? (
                  <img src={resolveMediaUrl(image.url)!} alt="" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <ImageIcon aria-hidden="true" className="size-5" />
                )}
                {i === 0 ? (
                  <span className="absolute top-1 left-1 z-1 rounded-[3px] bg-green-800 px-1.5 py-[3px] text-[11px] leading-none font-bold tracking-[0.04em] text-white">
                    Sampul
                  </span>
                ) : null}
              </div>
              <div className="grid min-w-0 flex-1 gap-1.5">
                <label className="sr-only" htmlFor={`cap-${image.id}`}>
                  Keterangan gambar {i + 1}
                </label>
                <input
                  id={`cap-${image.id}`}
                  defaultValue={image.caption ?? ""}
                  readOnly={!editable}
                  maxLength={500}
                  placeholder="Keterangan (opsional)"
                  onBlur={(event) => editable && void saveCaption(image, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.currentTarget.blur();
                    }
                  }}
                  className="w-full rounded-[4px] border border-line bg-white px-2.5 py-[7px] text-[13px] text-ink outline-none placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] read-only:bg-mint-50 read-only:text-muted"
                />
                {editable ? (
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="size-7!" disabled={i === 0} aria-label={`Naikkan gambar ${i + 1}`} onClick={() => void reorder(i, i - 1)}>
                      <ChevronUp aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7!" disabled={i === images.length - 1} aria-label={`Turunkan gambar ${i + 1}`} onClick={() => void reorder(i, i + 1)}>
                      <ChevronDown aria-hidden="true" />
                    </Button>
                    <span className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7! hover:text-danger"
                      aria-label={`Hapus gambar ${i + 1}`}
                      onClick={() => {
                        setRemoveError("");
                        setRemoving(i);
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
          {pending.map((item) => (
            <li key={item.key} className="flex items-center gap-2.5 rounded-[4px] border border-line bg-white p-2">
              <div className="relative aspect-[4/3] w-[84px] shrink-0 overflow-hidden rounded-[3px] bg-[#dce5e0] max-[640px]:w-[72px]">
                <img src={item.preview} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
                <div role="progressbar" aria-label="Mengunggah" className="absolute inset-x-1.5 bottom-1.5 z-1 h-1 overflow-hidden rounded-[2px] bg-white/70">
                  <span className="block h-full w-2/5 animate-pulse bg-green-800" />
                </div>
              </div>
              <span className="text-[13px] text-muted">Mengunggah…</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mb-2.5 text-[13px] text-muted">Belum ada gambar.</p>
      )}

      {editable ? (
        <>
          <label
            onDragOver={(event) => {
              if (dragFrom !== null) return;
              event.preventDefault();
              setDropOver(true);
            }}
            onDragLeave={() => setDropOver(false)}
            onDrop={(event) => {
              if (dragFrom !== null) return;
              event.preventDefault();
              setDropOver(false);
              void upload([...event.dataTransfer.files]);
            }}
            className={`grid cursor-pointer justify-items-center gap-1 rounded-[4px] border-[1.5px] border-dashed p-3.5 text-center transition-colors hover:border-green-800 hover:bg-mint has-focus-visible:border-green-800 ${
              uploadErrors.length
                ? "border-danger bg-danger-bg"
                : dropOver
                  ? "border-green-800 bg-mint"
                  : "border-line-strong bg-mint-50"
            }`}
          >
            <Upload aria-hidden="true" className="mb-0.5 size-[26px] text-green-800" />
            <strong className="text-green-900">Tambah gambar</strong>
            <span className="text-xs text-muted">
              JPG, PNG, atau WebP · maks 4 MB per file · otomatis dikompres
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => {
                const files = [...(event.target.files ?? [])];
                event.target.value = "";
                void upload(files);
              }}
            />
          </label>
          {uploadErrors.length ? (
            <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-danger">
              <TriangleAlert aria-hidden="true" className="mt-px size-[13px] shrink-0" />
              <span>
                {uploadErrors.map((message, i) => (
                  <span key={i} className="block">
                    {message}
                  </span>
                ))}
              </span>
            </p>
          ) : null}
        </>
      ) : null}

      <ConfirmDialog
        open={removing !== null}
        title="Hapus gambar ini?"
        description={
          removing === 0
            ? "Gambar ini adalah sampul. Setelah dihapus, gambar berikutnya menjadi sampul."
            : "Gambar akan dihapus dari galeri publikasi."
        }
        confirmLabel="Hapus"
        busyLabel="Menghapus..."
        busy={removeBusy}
        error={removeError}
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />
    </Card>
  );
}
```

### A9. `features/news/components/admin/NewsEditor.tsx`
_editor publikasi_

```tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ExternalLink, Eye, RefreshCw, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { Notice } from "@/components/admin/shared/Notice";
import { PageHead } from "@/components/admin/shared/PageHead";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { useToast } from "@/components/admin/shared/Toast";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { Select } from "@/components/ui/Select";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import { ApiError } from "@/lib/api/errors";
import { relativeTime } from "@/lib/relative-time";

import {
  createAdminNews,
  createAdminNewsTag,
  deleteAdminNews,
  getAdminNewsByIdentifier,
  getAdminNewsTags,
  updateAdminNews,
} from "../../admin-api";
import { NEWS_STATUS } from "../../status";
import type { AdminNews, NewsImage, NewsStatus, NewsTag } from "../../types";
import { NewsContentField } from "./NewsContentField";
import { NewsGallery } from "./NewsGallery";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const dateTimeFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Datetime backend tanpa zona waktu dianggap UTC (lihat `relativeTime`). */
function formatDateTime(value: string) {
  return dateTimeFormat.format(new Date(/Z|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`));
}

type Errors = Partial<Record<"title" | "slug" | "content", string>>;

/**
 * Editor publikasi, mengikuti `newsEditor()` di Design/admin.
 * `newsId = null` untuk publikasi baru.
 */
export function NewsEditor({ newsId }: { newsId: number | null }) {
  const isNew = newsId === null;
  const router = useRouter();
  const toast = useToast();
  const { admin, can } = useAuth();
  const editable = isNew || can(PERMISSIONS.NEWS_UPDATE);
  const canCreateTag = can(PERMISSIONS.NEWS_CREATE);
  const canDelete = can(PERMISSIONS.NEWS_DELETE);

  const [news, setNews] = useState<AdminNews | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "missing" | "error">(
    isNew ? "ready" : "loading",
  );
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [allTags, setAllTags] = useState<NewsTag[]>([]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<NewsStatus>("draft");
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [newTag, setNewTag] = useState("");
  const [tagBusy, setTagBusy] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<"save" | "publish" | null>(null);
  const [dirty, setDirty] = useState(false);

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    getAdminNewsTags()
      .then((result) => setAllTags(result.items))
      .catch(() => setAllTags([]));
  }, []);

  useEffect(() => {
    if (newsId === null) return;
    let active = true;

    getAdminNewsByIdentifier(newsId)
      .then((result) => {
        if (!active) return;
        setNews(result);
        setTitle(result.title);
        setSlug(result.slug);
        setContent(result.content);
        setStatus(result.status);
        setTagIds(result.tags.map((tag) => tag.id));
        setLoadState("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setLoadState("missing");
        } else {
          setLoadError(err instanceof Error ? err.message : "Publikasi gagal dimuat.");
          setLoadState("error");
        }
      });

    return () => {
      active = false;
    };
  }, [newsId, reloadKey]);

  // Peringatan bawaan peramban saat menutup/memuat ulang tab dengan perubahan belum disimpan.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  }

  function onTitleChange(value: string) {
    setTitle(value);
    setDirty(true);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleTag(id: number) {
    setTagIds((current) =>
      current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id],
    );
    setDirty(true);
  }

  async function addTag() {
    const name = newTag.trim();
    if (!name) return;

    if (allTags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) {
      toast("Tag itu sudah ada.", "error");
      return;
    }

    setTagBusy(true);
    try {
      const tag = await createAdminNewsTag({ name });
      setAllTags((current) => [...current, tag]);
      setTagIds((current) => [...current, tag.id]);
      setNewTag("");
      setDirty(true);
      toast(`Tag “${tag.name}” dibuat.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Tag gagal dibuat.", "error");
    } finally {
      setTagBusy(false);
    }
  }

  function validate(): Errors {
    const next: Errors = {};
    const cleanTitle = title.trim();
    const cleanSlug = slug.trim();

    if (!cleanTitle) next.title = "Judul wajib diisi.";
    else if (cleanTitle.length < 2) next.title = "Judul minimal 2 karakter.";

    if (!cleanSlug) next.slug = "Alamat halaman wajib diisi.";
    else if (!SLUG_PATTERN.test(cleanSlug))
      next.slug = "Gunakan huruf kecil, angka, dan tanda hubung saja.";

    if (!content.trim()) next.content = "Isi publikasi wajib diisi.";
    return next;
  }

  async function save(act: "save" | "publish") {
    if (!editable || saving) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      toast("Periksa kembali isian yang ditandai.", "error");
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      status: act === "publish" ? ("published" as const) : status,
      tag_ids: tagIds,
    };

    setSaving(act);
    try {
      if (isNew) {
        const created = await createAdminNews(payload);
        setDirty(false);
        toast(
          act === "publish"
            ? "Publikasi diterbitkan."
            : "Draft disimpan. Sekarang Anda bisa menambahkan gambar.",
        );
        router.replace(`/admin/news/${created.id}`);
        return;
      }

      const updated = await updateAdminNews(news!.id, payload);
      setNews(updated);
      setStatus(updated.status);
      setSlug(updated.slug);
      setDirty(false);
      toast(act === "publish" ? "Publikasi diterbitkan." : "Perubahan disimpan.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ slug: "Alamat ini sudah dipakai publikasi lain." });
        toast("Alamat halaman sudah dipakai.", "error");
      } else {
        toast(err instanceof Error ? err.message : "Publikasi gagal disimpan.", "error");
      }
    } finally {
      setSaving(null);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    void save(submitter?.value === "publish" ? "publish" : "save");
  }

  async function confirmDelete() {
    if (!news) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await deleteAdminNews(news.id);
      setDirty(false);
      toast("Publikasi dihapus.");
      router.push("/admin/news");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Publikasi gagal dihapus.");
      setDeleteBusy(false);
    }
  }

  if (loadState === "loading") {
    return (
      <div role="status" aria-label="Memuat publikasi" className="animate-pulse">
        <div className="mb-[26px] grid gap-3">
          <div className="h-[11px] w-[90px] rounded-[3px] bg-green-900/5" />
          <div className="h-7 w-[260px] rounded-[3px] bg-green-900/5" />
        </div>
        <div className="grid items-start gap-5 min-[1101px]:grid-cols-[1fr_320px]">
          <div className="h-[520px] rounded-[4px] bg-green-900/5" />
          <div className="h-[260px] rounded-[4px] bg-green-900/5" />
        </div>
      </div>
    );
  }

  if (loadState === "missing" || loadState === "error") {
    const missing = loadState === "missing";
    return (
      <Card>
        <StateBlock
          tone={missing ? "default" : "error"}
          icon={missing ? <Search /> : <RefreshCw />}
          label={missing ? "Tidak ditemukan" : "Gagal memuat"}
          title={missing ? "Publikasi tidak ditemukan" : "Publikasi tidak dapat dimuat"}
          action={
            missing ? (
              <ButtonLink href="/admin/news" variant="outline">
                Kembali ke daftar
              </ButtonLink>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setLoadState("loading");
                  setReloadKey((key) => key + 1);
                }}
              >
                <RefreshCw aria-hidden="true" /> Coba lagi
              </Button>
            )
          }
        >
          {missing ? "Publikasi ini mungkin sudah dihapus." : loadError}
        </StateBlock>
      </Card>
    );
  }

  const savedStatus = news?.status ?? "draft";
  const savedInfo = NEWS_STATUS[savedStatus];
  const saveText = isNew
    ? "Belum disimpan"
    : dirty
      ? "Ada perubahan belum disimpan"
      : `Tersimpan · ${relativeTime(news?.updated_at ?? null)}`;
  const authorName = news && admin && news.author_id === admin.id ? admin.username : null;

  return (
    <>
      <PageHead
        label="Publikasi"
        title={isNew ? "Tulis publikasi" : editable ? "Edit publikasi" : "Lihat publikasi"}
        actions={
          <>
            {editable ? (
              <div role="status" className="flex items-center gap-2.5 self-center text-xs text-muted">
                <span
                  aria-hidden="true"
                  className={`size-[7px] rounded-full ${!isNew && !dirty ? "bg-green-700" : "bg-amber"}`}
                />
                {saveText}
              </div>
            ) : null}
            {news?.status === "published" ? (
              <a
                href={`/publikasi/${news.slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex h-[38px] items-center gap-2 rounded-[4px] border border-line-strong bg-white px-4 text-[11.5px] leading-none font-semibold tracking-[0.08em] text-green-900 uppercase no-underline hover:border-green-800 [&_svg]:size-[15px]"
              >
                <ExternalLink aria-hidden="true" /> Lihat di situs
              </a>
            ) : null}
            <Button
              variant="outline"
              onClick={() => (dirty ? setLeaveOpen(true) : router.push("/admin/news"))}
            >
              Kembali
            </Button>
          </>
        }
      />

      {!editable ? (
        <Notice icon={<Eye aria-hidden="true" />} className="mb-4">
          <strong>Mode lihat saja.</strong> Akun Anda dapat melihat publikasi ini
          tetapi tidak dapat mengubahnya (butuh izin “Ubah publikasi”).
        </Notice>
      ) : null}

      <form
        ref={formRef}
        noValidate
        onSubmit={onSubmit}
        className="grid grid-cols-1 items-start gap-5 min-[1101px]:grid-cols-[minmax(0,1fr)_320px]"
      >
        <Card className="min-w-0">
          <div className="grid gap-1.5">
            <label htmlFor="news-title" className="sr-only">
              Judul
            </label>
            <input
              id="news-title"
              name="title"
              value={title}
              readOnly={!editable}
              maxLength={255}
              placeholder="Judul publikasi"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "news-title-error" : undefined}
              onChange={(event) => onTitleChange(event.target.value)}
              className="w-full border-0 border-b border-line bg-transparent px-0 pt-1 pb-3.5 font-serif text-[28px] leading-[1.3] font-bold text-green-900 outline-none placeholder:text-[#b6c2bc] focus-visible:border-green-800 aria-invalid:border-danger max-[640px]:text-2xl"
            />
            {errors.title ? (
              <p id="news-title-error" role="alert" className="text-xs text-danger">
                {errors.title}
              </p>
            ) : null}
          </div>

          <FormField
            className="mt-4"
            label="Alamat halaman"
            required
            hint="Terisi otomatis dari judul. Hanya huruf kecil, angka, dan tanda hubung; harus unik."
            error={errors.slug}
          >
            <SlugInput
              value={slug}
              readOnly={!editable}
              onChange={(value) => {
                setSlugTouched(true);
                change(setSlug)(value);
              }}
            />
          </FormField>

          <NewsContentField
            value={content}
            onChange={change(setContent)}
            readOnly={!editable}
            error={errors.content}
          />
        </Card>

        <div className="grid min-w-0 grid-cols-1 gap-4 min-[1101px]:sticky min-[1101px]:top-[84px]">
          <Card
            title="Status"
            action={isNew ? undefined : <Badge tone={savedInfo.tone}>{savedInfo.label}</Badge>}
          >
            <FormField label="Status">
              <Select
                name="status"
                value={status}
                disabled={!editable}
                onChange={(event) => change(setStatus)(event.target.value as NewsStatus)}
              >
                <option value="draft">Draft — tidak tampil</option>
                <option value="published">Terbit — tampil di situs</option>
                <option value="archived">Arsip — disembunyikan</option>
              </Select>
            </FormField>
            <p className="mt-2.5 text-xs text-muted">
              {news?.published_at
                ? `Terbit ${formatDateTime(news.published_at)}`
                : "Tanggal terbit diisi otomatis saat status diubah ke Terbit."}
              {authorName ? (
                <>
                  <br />
                  Penulis: {authorName}
                </>
              ) : null}
            </p>
            {editable ? (
              <div className="mt-4 grid gap-2">
                <Button type="submit" value="save" disabled={saving !== null}>
                  {saving === "save" ? "Menyimpan..." : isNew ? "Simpan draft" : "Simpan perubahan"}
                </Button>
                {savedStatus !== "published" ? (
                  <Button type="submit" value="publish" variant="outline" disabled={saving !== null}>
                    {saving === "publish" ? "Menerbitkan..." : "Simpan & terbitkan"}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </Card>

          <Card title="Tag">
            <div className="flex flex-wrap gap-1.5">
              {allTags.length === 0 ? (
                <p className="text-[13px] text-muted">Belum ada tag.</p>
              ) : null}
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={tagIds.includes(tag.id)}
                  disabled={!editable}
                  onClick={() => toggleTag(tag.id)}
                  className="inline-flex h-7 cursor-pointer items-center rounded-[14px] border border-line bg-white px-2.5 text-[12.5px] transition-colors hover:border-green-800 disabled:cursor-default disabled:hover:border-line aria-pressed:border-green-800 aria-pressed:bg-green-800 aria-pressed:text-white"
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {editable && canCreateTag ? (
              <div className="mt-3 flex">
                <label htmlFor="news-new-tag" className="sr-only">
                  Tag baru
                </label>
                <input
                  id="news-new-tag"
                  value={newTag}
                  maxLength={100}
                  placeholder="Tag baru…"
                  onChange={(event) => setNewTag(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void addTag();
                    }
                  }}
                  className="min-w-0 flex-1 rounded-l-[4px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)]"
                />
                <Button
                  variant="outline"
                  className="h-auto! rounded-l-none border-l-0"
                  disabled={tagBusy || newTag.trim().length < 2}
                  onClick={() => void addTag()}
                >
                  Tambah
                </Button>
              </div>
            ) : null}
          </Card>

          <NewsGallery
            newsId={news?.id ?? null}
            images={news?.images ?? []}
            editable={editable}
            onImagesChange={(images: NewsImage[]) =>
              setNews((current) => (current ? { ...current, images } : current))
            }
            onSaveFirst={() => void save("save")}
          />

          {!isNew && canDelete ? (
            <Card>
              <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-danger uppercase">
                Zona berbahaya
              </p>
              <p className="mt-1.5 mb-3 text-[13px] text-muted">
                Menghapus publikasi juga menghapus semua gambarnya.
              </p>
              <Button
                variant="danger-outline"
                onClick={() => {
                  setDeleteError("");
                  setDeleteOpen(true);
                }}
              >
                <Trash2 aria-hidden="true" /> Hapus publikasi
              </Button>
            </Card>
          ) : null}
        </div>
      </form>

      <ConfirmDialog
        open={leaveOpen}
        tone="default"
        title="Tinggalkan halaman ini?"
        description="Ada perubahan yang belum disimpan. Jika Anda pindah halaman, perubahan itu akan hilang."
        confirmLabel="Tinggalkan"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => {
          setDirty(false);
          setLeaveOpen(false);
          router.push("/admin/news");
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Hapus publikasi?"
        description={`“${news?.title ?? ""}” dan semua gambarnya akan dihapus permanen.`}
        confirmLabel="Hapus"
        busyLabel="Menghapus..."
        busy={deleteBusy}
        error={deleteError}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

/** Input slug dengan awalan `/publikasi/` (`.input-group` + `.prefix`). */
function SlugInput({
  value,
  readOnly,
  onChange,
  ...aria
}: {
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
}) {
  return (
    <div className="flex">
      <span className="grid place-items-center rounded-l-[4px] border border-r-0 border-line bg-mint-50 px-2.5 text-xs whitespace-nowrap text-muted">
        /publikasi/
      </span>
      <input
        {...aria}
        name="slug"
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full min-w-0 rounded-r-[4px] border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] read-only:bg-mint-50 read-only:text-muted aria-invalid:border-danger"
      />
    </div>
  );
}
```

### A10. `app/(private)/(admin)/admin/news/new/page.tsx`
_route `/admin/news/new`_

```tsx
"use client";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { PERMISSIONS } from "@/features/auth/permissions";
import { NewsEditor } from "@/features/news/components/admin/NewsEditor";

export default function NewNewsPage() {
  return (
    <RequirePermission permission={PERMISSIONS.NEWS_CREATE}>
      <AdminPage>
        <NewsEditor newsId={null} />
      </AdminPage>
    </RequirePermission>
  );
}
```

### A11. `app/(private)/(admin)/admin/news/[id]/page.tsx`
_route `/admin/news/{id}`_

```tsx
"use client";

import { useParams } from "next/navigation";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { PERMISSIONS } from "@/features/auth/permissions";
import { NewsEditor } from "@/features/news/components/admin/NewsEditor";

export default function EditNewsPage() {
  const { id } = useParams<{ id: string }>();
  const newsId = Number(id);

  return (
    <RequirePermission permission={PERMISSIONS.NEWS_VIEW}>
      <AdminPage>
        {/* key: editor dimuat ulang bersih saat pindah dari /new ke /[id]. */}
        <NewsEditor key={id} newsId={Number.isInteger(newsId) && newsId > 0 ? newsId : -1} />
      </AdminPage>
    </RequirePermission>
  );
}
```

## Bagian B — Ganti seluruh isi

### B1. `app/(private)/(admin)/admin/news/page.tsx`
_halaman daftar jadi pembungkus tipis_

```tsx
"use client";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { PERMISSIONS } from "@/features/auth/permissions";
import NewsList from "@/features/news/components/admin/NewsList";

export default function NewsPage() {
  return (
    <RequirePermission permission={PERMISSIONS.NEWS_VIEW}>
      <AdminPage>
        <NewsList />
      </AdminPage>
    </RequirePermission>
  );
}
```

### B2. `features/news/components/admin/NewsList.tsx`
_daftar publikasi baru (cari, filter status & tag, tabel, hapus)_

```tsx
"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Eye,
  FileText,
  ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { Pager, Table, Td, Th, Tr } from "@/components/admin/shared/DataTable";
import {
  SearchInput,
  Segmented,
  SelectSm,
  Toolbar,
} from "@/components/admin/shared/ListControls";
import { Notice } from "@/components/admin/shared/Notice";
import { PageHead } from "@/components/admin/shared/PageHead";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { useToast } from "@/components/admin/shared/Toast";
import { Button, ButtonLink } from "@/components/ui/Button";
import { getAdminAccounts } from "@/features/accounts/api";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import { resolveMediaUrl } from "@/lib/media/api";

import {
  deleteAdminNews,
  getAdminNews,
  getAdminNewsTags,
} from "../../admin-api";
import { formatNewsDateShort } from "../../format";
import { NEWS_STATUS } from "../../status";
import type { AdminNews, NewsStatus, NewsTag } from "../../types";

const PER_PAGE = 10;
const FETCH_LIMIT = 100;
const MAX_FETCH_PAGES = 10;

type StatusFilter = "all" | NewsStatus;

/**
 * Backend belum menyediakan total, pencarian, dan filter tag, jadi semua
 * publikasi (maks. 1.000) dimuat sekali lalu disaring di browser.
 */
async function loadAllNews(signal: AbortSignal): Promise<AdminNews[]> {
  const all: AdminNews[] = [];

  for (let page = 0; page < MAX_FETCH_PAGES; page++) {
    const result = await getAdminNews(
      { offset: page * FETCH_LIMIT, limit: FETCH_LIMIT },
      { signal },
    );
    all.push(...result.items);
    if (result.items.length < FETCH_LIMIT) break;
  }

  return all.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

/** Halaman daftar publikasi, mengikuti `viewNews()` di Design/admin. */
export default function NewsList() {
  const { admin, can } = useAuth();
  const toast = useToast();
  const canCreate = can(PERMISSIONS.NEWS_CREATE);
  const canUpdate = can(PERMISSIONS.NEWS_UPDATE);
  const canDelete = can(PERMISSIONS.NEWS_DELETE);
  const canViewAdmins = can(PERMISSIONS.ADMINS_VIEW);

  const [items, setItems] = useState<AdminNews[] | null>(null);
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [authors, setAuthors] = useState<Map<number, string>>(new Map());
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tagId, setTagId] = useState("");
  const [page, setPage] = useState(1);

  const [deleting, setDeleting] = useState<AdminNews | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      loadAllNews(controller.signal),
      getAdminNewsTags().catch(() => ({ items: [] })),
      canViewAdmins
        ? getAdminAccounts({ signal: controller.signal }).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([news, tagResult, accounts]) => {
        const names = new Map<number, string>();
        accounts?.items.forEach((account) => names.set(account.id, account.username));
        if (admin) names.set(admin.id, admin.username);

        setItems(news);
        setTags(tagResult.items);
        setAuthors(names);
        setError("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Daftar publikasi gagal dimuat.");
      });

    return () => controller.abort();
  }, [admin, canViewAdmins, reloadKey]);

  const counts = useMemo(() => {
    const result = { all: 0, published: 0, draft: 0, archived: 0 };
    items?.forEach((item) => {
      result.all++;
      result[item.status]++;
    });
    return result;
  }, [items]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (item) =>
        (status === "all" || item.status === status) &&
        (!tagId || item.tags.some((tag) => String(tag.id) === tagId)) &&
        (!q || item.title.toLowerCase().includes(q)),
    );
  }, [items, query, status, tagId]);

  const pageRows = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setTagId("");
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");

    try {
      await deleteAdminNews(deleting.id);
      setItems((current) => current?.filter((item) => item.id !== deleting.id) ?? null);
      setDeleting(null);
      toast("Publikasi dihapus.");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Publikasi gagal dihapus.");
    } finally {
      setDeleteBusy(false);
    }
  }

  let body;

  if (error) {
    body = (
      <StateBlock
        tone="error"
        icon={<RefreshCw />}
        label="Gagal memuat"
        title="Publikasi tidak dapat dimuat"
        action={
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setItems(null);
              setReloadKey((key) => key + 1);
            }}
          >
            <RefreshCw aria-hidden="true" /> Coba lagi
          </Button>
        }
      >
        {error}
      </StateBlock>
    );
  } else if (items === null) {
    body = (
      <div role="status" aria-label="Memuat publikasi" className="grid gap-4 p-4">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex animate-pulse items-center gap-3">
            <div className="aspect-[3/2] w-16 rounded-[3px] bg-green-900/5" />
            <div className="grid flex-1 gap-2">
              <div className="h-3 w-3/5 rounded-[3px] bg-green-900/5" />
              <div className="h-2.5 w-1/4 rounded-[3px] bg-green-900/5" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (items.length === 0) {
    body = (
      <StateBlock
        icon={<FileText />}
        label="Publikasi"
        title="Belum ada publikasi"
        action={
          canCreate ? <ButtonLink href="/admin/news/new">Tulis publikasi</ButtonLink> : undefined
        }
      >
        Mulai dengan menulis kabar atau dokumentasi kegiatan pertama.
      </StateBlock>
    );
  } else if (rows.length === 0) {
    body = (
      <StateBlock
        icon={<Search />}
        label="Pencarian"
        title={`Tidak ada hasil untuk “${query.trim() || "filter ini"}”`}
        action={
          <Button variant="outline" onClick={resetFilters}>
            Reset filter
          </Button>
        }
      >
        Periksa ejaan atau ubah filter yang dipakai.
      </StateBlock>
    );
  } else {
    body = (
      <>
        <Table
          head={
            <>
              <Th>Judul</Th>
              <Th>Status</Th>
              <Th>Tag</Th>
              <Th>Penulis</Th>
              <Th>Diperbarui</Th>
              <Th>
                <span className="sr-only">Aksi</span>
              </Th>
            </>
          }
        >
          {pageRows.map((item) => {
            const cover = resolveMediaUrl(item.images[0]?.url);
            const statusInfo = NEWS_STATUS[item.status];

            return (
              <Tr key={item.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="grid aspect-[3/2] w-16 shrink-0 place-items-center overflow-hidden rounded-[3px] bg-[#dce5e0] text-muted-light [&_svg]:size-[18px]">
                      {cover ? (
                        <img src={cover} alt="" className="size-full object-cover grayscale" />
                      ) : (
                        <ImageIcon aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-green-900">{item.title}</div>
                      <div className="mt-0.5 text-xs text-muted">
                        {item.images.length ? `${item.images.length} gambar` : "Belum ada gambar"}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td label="Status">
                  <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                </Td>
                <Td label="Tag">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge key={tag.id} tone="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </Td>
                <Td label="Penulis">
                  {(item.author_id !== null && authors.get(item.author_id)) || "—"}
                </Td>
                <Td label="Diperbarui" className="text-xs">
                  {formatNewsDateShort(item.updated_at) ?? "—"}
                </Td>
                <Td actions>
                  <div className="inline-flex gap-1">
                    {item.status === "published" ? (
                      <a
                        href={`/publikasi/${item.slug}`}
                        target="_blank"
                        rel="noopener"
                        title="Lihat di situs"
                        aria-label={`Lihat “${item.title}” di situs`}
                        className="inline-flex size-[34px] items-center justify-center rounded-[4px] text-muted hover:bg-mint-50 hover:text-green-900 [&_svg]:size-[15px]"
                      >
                        <ExternalLink aria-hidden="true" />
                      </a>
                    ) : null}
                    <ButtonLink href={`/admin/news/${item.id}`} variant="outline" size="sm">
                      {canUpdate ? (
                        <>
                          <Pencil aria-hidden="true" /> Edit
                        </>
                      ) : (
                        <>
                          <Eye aria-hidden="true" /> Lihat
                        </>
                      )}
                    </ButtonLink>
                    {canDelete ? (
                      <Button
                        variant="danger-outline"
                        size="icon"
                        className="size-8!"
                        aria-label={`Hapus “${item.title}”`}
                        onClick={() => {
                          setDeleteError("");
                          setDeleting(item);
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
        <Pager total={rows.length} page={page} perPage={PER_PAGE} onPage={setPage} />
      </>
    );
  }

  return (
    <>
      <PageHead
        label="Konten"
        title="Publikasi"
        description="Berita dan dokumentasi kegiatan. Hanya publikasi berstatus Terbit yang tampil di situs."
        actions={
          canCreate ? (
            <ButtonLink href="/admin/news/new">
              <Plus aria-hidden="true" /> Tulis publikasi
            </ButtonLink>
          ) : undefined
        }
      />

      {!canUpdate ? (
        <Notice icon={<Eye aria-hidden="true" />} className="mb-4">
          <strong>Mode lihat saja.</strong> Akun Anda dapat melihat publikasi
          tetapi tidak dapat mengubahnya (butuh izin “Ubah publikasi”).
        </Notice>
      ) : null}

      <Card bodyClassName="p-0">
        <Toolbar>
          <SearchInput
            placeholder="Cari judul…"
            aria-label="Cari publikasi"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Segmented<StatusFilter>
            label="Status"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "Semua", count: counts.all },
              { value: "published", label: "Terbit", count: counts.published },
              { value: "draft", label: "Draft", count: counts.draft },
              { value: "archived", label: "Arsip", count: counts.archived },
            ]}
          />
          <SelectSm
            aria-label="Tag"
            value={tagId}
            onChange={(event) => {
              setTagId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </SelectSm>
        </Toolbar>
        {body}
      </Card>

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus publikasi?"
        description={`“${deleting?.title ?? ""}” beserta semua gambarnya akan dihapus permanen dan tidak bisa dikembalikan.`}
        confirmLabel="Hapus"
        busyLabel="Menghapus..."
        busy={deleteBusy}
        error={deleteError}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
```

### B3. `features/news/content.tsx`
_isi publikasi di situs publik dirender sebagai Markdown_

```tsx
import { Markdown } from "@/lib/markdown";

/**
 * Isi publikasi dirender dari Markdown (lihat `lib/markdown.tsx`): elemen
 * React biasa, tanpa `dangerouslySetInnerHTML`. Isi lama berupa teks polos
 * tetap tampil sebagai paragraf.
 */
export function NewsContent({ content }: { content: string | null }) {
  return <Markdown source={content} variant="public" />;
}
```

### B4. `components/admin/shell/admin-navigation.tsx`
_tambah `subPageFor` untuk breadcrumb Baru/Edit_

```tsx
import type { ReactNode } from "react";
import {
  BarChart3,
  FileText,
  History,
  LayoutGrid,
  ListChecks,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  PERMISSIONS,
  type PermissionName,
} from "@/features/auth/permissions";

export type NavGroup = "Utama" | "Konten" | "Organisasi" | "Sistem";

export interface NavItem {
  href: string;
  label: string;
  permission: PermissionName;
  group: NavGroup;
  icon: ReactNode;
  exact?: boolean;
}

/** Urutan dan pengelompokan mengikuti `ROUTES` di Design/admin/assets/admin.js. */
export const navGroups: NavGroup[] = ["Utama", "Konten", "Organisasi", "Sistem"];

export const navItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    permission: PERMISSIONS.DASHBOARD_VIEW,
    group: "Utama",
    exact: true,
    icon: <LayoutGrid />,
  },
  {
    href: "/admin/news",
    label: "Publikasi",
    permission: PERMISSIONS.NEWS_VIEW,
    group: "Konten",
    icon: <FileText />,
  },
  {
    href: "/admin/programs",
    label: "Program Kerja",
    permission: PERMISSIONS.PROGRAMS_VIEW,
    group: "Konten",
    icon: <ListChecks />,
  },
  {
    href: "/admin/organization",
    label: "Struktur Organisasi",
    permission: PERMISSIONS.ORGANIZATION_VIEW,
    group: "Organisasi",
    icon: <Users />,
  },
  {
    href: "/admin/accounts",
    label: "Administrator",
    permission: PERMISSIONS.ADMINS_VIEW,
    group: "Sistem",
    icon: <ShieldCheck />,
  },
  {
    href: "/admin/activity-logs",
    label: "Log Aktivitas",
    permission: PERMISSIONS.ACTIVITY_LOGS_VIEW,
    group: "Sistem",
    icon: <History />,
  },
  {
    href: "/admin/visitor-logs",
    label: "Statistik Pengunjung",
    permission: PERMISSIONS.VISITOR_LOGS_VIEW,
    group: "Sistem",
    icon: <BarChart3 />,
  },
  {
    href: "/admin/settings",
    label: "Pengaturan Situs",
    permission: PERMISSIONS.SETTINGS_VIEW,
    group: "Sistem",
    icon: <Settings />,
  },
];

/** Hanya route yang halamannya sudah ada yang tampil di menu. */
export const implementedAdminRoutes = new Set([
  "/admin/dashboard",
  "/admin/news",
  "/admin/programs",
  "/admin/organization",
  "/admin/accounts",
  "/admin/account",
  "/admin/settings",
]);

export function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Judul halaman untuk breadcrumb topbar. */
export function pageTitleFor(pathname: string): string {
  if (pathname === "/admin/account") return "Akun Saya";
  const item = navItems.find((nav) => isItemActive(pathname, nav));
  return item?.label ?? "Admin";
}

/**
 * Sub-halaman di bawah menu (mis. `/admin/news/new` atau `/admin/news/12`)
 * untuk breadcrumb "Admin / Publikasi / Baru". `null` bila bukan sub-halaman.
 */
export function subPageFor(
  pathname: string,
): { parentHref: string; label: string } | null {
  const item = navItems.find((nav) => isItemActive(pathname, nav));
  if (!item || pathname === item.href) return null;

  const rest = pathname.slice(item.href.length + 1);
  return { parentHref: item.href, label: rest === "new" ? "Baru" : "Edit" };
}
```

### B5. `components/admin/shell/AdminTopbar.tsx`
_breadcrumb `Admin / Publikasi / Edit`_

```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, LogOut, Menu, UserRound } from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";

function initials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part.charAt(0));
  return (letters.join("") || "A").toUpperCase();
}

/** `.topbar` + `.crumbs` + `.user` + `.dropdown` di Design/admin/assets/admin.css. */
export function AdminTopbar({
  title,
  subPage,
  menuOpen,
  onMenuOpen,
  menuButtonRef,
}: {
  title: string;
  subPage: { parentHref: string; label: string } | null;
  menuOpen: boolean;
  onMenuOpen: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { admin, isSuperadmin, logout } = useAuth();
  const router = useRouter();
  const [userOpen, setUserOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userOpen) return;

    function handleClick(event: MouseEvent) {
      if (!userRef.current?.contains(event.target as Node)) {
        setUserOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setUserOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [userOpen]);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      router.replace("/login");
    } catch {
      setLogoutError("Logout gagal. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const username = admin?.username ?? "Admin";
  const roleLabel = isSuperadmin ? "Superadmin" : "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-[rgba(251,253,252,0.94)] px-4 backdrop-blur-[8px] min-[901px]:px-8">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuOpen}
        aria-label="Buka navigasi"
        aria-expanded={menuOpen}
        aria-controls="admin-navigation"
        className="grid size-[38px] cursor-pointer place-items-center rounded-[4px] text-muted hover:bg-mint-50 hover:text-green-900 min-[901px]:hidden [&_svg]:size-[19px]"
      >
        <Menu aria-hidden="true" />
      </button>

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-2 text-xs text-muted"
      >
        <Link
          href="/admin/dashboard"
          className="text-muted no-underline hover:text-green-800"
        >
          Admin
        </Link>
        <span aria-hidden="true">/</span>
        {subPage ? (
          <>
            <Link
              href={subPage.parentHref}
              className="truncate text-muted no-underline hover:text-green-800"
            >
              {title}
            </Link>
            <span aria-hidden="true">/</span>
            <strong className="font-semibold text-green-900">{subPage.label}</strong>
          </>
        ) : (
          <strong className="truncate font-semibold text-green-900">{title}</strong>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          aria-label="Lihat situs (tab baru)"
          className="inline-flex h-8 w-[34px] items-center justify-center gap-2 rounded-[4px] border border-line-strong bg-white text-[11px] leading-none font-semibold tracking-[0.08em] text-green-900 uppercase no-underline transition-colors hover:border-green-800 min-[901px]:w-auto min-[901px]:px-[11px] [&_svg]:size-[15px]"
        >
          <ExternalLink aria-hidden="true" />
          <span className="hidden min-[901px]:inline">Lihat situs</span>
        </a>

        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            className="flex cursor-pointer items-center gap-2.5 rounded-[4px] border border-transparent bg-transparent py-1 pr-1.5 pl-1 hover:border-line hover:bg-white"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-green-800 text-xs font-bold text-white">
              {initials(username)}
            </span>
            <span className="hidden text-left min-[901px]:block">
              <span className="block text-[13px] leading-[1.2] font-semibold text-ink">
                {username}
              </span>
              <span className="block text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                {roleLabel}
              </span>
            </span>
          </button>

          {userOpen ? (
            <div
              role="menu"
              className="absolute top-[calc(100%+6px)] right-0 z-40 min-w-60 rounded-[6px] border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(6,38,27,0.12)]"
            >
              <div className="mb-1.5 border-b border-line px-2.5 pt-2.5 pb-2">
                <p className="text-[13px] font-semibold text-ink">{username}</p>
                <p className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                  {roleLabel}
                </p>
              </div>

              <Link
                href="/admin/account"
                role="menuitem"
                onClick={() => setUserOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-[3px] px-2.5 py-[9px] text-[13px] text-ink no-underline hover:bg-mint-50 [&_svg]:size-4 [&_svg]:text-muted"
              >
                <UserRound aria-hidden="true" />
                Akun saya
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[3px] border-0 bg-transparent px-2.5 py-[9px] text-left text-[13px] text-ink hover:bg-mint-50 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4 [&_svg]:text-muted"
              >
                <LogOut aria-hidden="true" />
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </button>

              {logoutError ? (
                <p role="alert" className="px-2.5 pt-1 pb-2 text-xs text-danger">
                  {logoutError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
```

### B6. `components/admin/shell/AdminShell.tsx`
_pasang ToastProvider + kirim subPage ke topbar_

```tsx
"use client";

import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { ToastProvider } from "@/components/admin/shared/Toast";
import { getPublicOrganization } from "@/features/organization/public-api";

import { pageTitleFor, subPageFor } from "./admin-navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

/**
 * Kerangka panel admin, mengikuti `.shell` di Design/admin/assets/admin.css:
 * sidebar 256px (≤900px menjadi panel geser), topbar 64px, lalu konten.
 * Konten tidak diberi padding di sini; tiap halaman memakai <AdminPage>.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [periodName, setPeriodName] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getPublicOrganization({ signal: controller.signal })
      .then((data) => setPeriodName(data.period?.name ?? null))
      .catch(() => {
        /* Nama periode hanya informasi tambahan di sidebar. */
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobileMenu();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  return (
    <div className="admin-theme min-h-screen">
      <a
        href="#content"
        className="absolute -top-16 left-3 z-[200] rounded-[4px] bg-green-800 px-3.5 py-2 text-white focus:top-3"
      >
        Langsung ke konten
      </a>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Tutup navigasi"
          className="fixed inset-0 z-[65] cursor-default bg-[rgba(6,38,27,0.42)] min-[901px]:hidden"
          onClick={closeMobileMenu}
        />
      ) : null}

      <aside
        id="admin-navigation"
        aria-label="Navigasi admin"
        className={`fixed inset-y-0 left-0 z-[70] w-[280px] overflow-y-auto border-r border-line-on-dark transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] min-[901px]:z-40 min-[901px]:w-64 min-[901px]:translate-x-0 ${
          mobileOpen
            ? "translate-x-0 shadow-[20px_0_50px_rgba(6,38,27,0.3)]"
            : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          pathname={pathname}
          periodName={periodName}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col min-[901px]:pl-64">
        <AdminTopbar
          title={pageTitleFor(pathname)}
          subPage={subPageFor(pathname)}
          menuOpen={mobileOpen}
          onMenuOpen={() => setMobileOpen(true)}
          menuButtonRef={menuButtonRef}
        />

        <div id="content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <ToastProvider>{children}</ToastProvider>
        </div>
      </div>
    </div>
  );
}
```

### B7. `app/(private)/(admin)/admin/dashboard/page.tsx`
_tiga tautan diarahkan ke editor (`/admin/news/new` dan `/admin/news/{id}`)_

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  ListChecks,
  Plus,
  TriangleAlert,
  Users,
} from "lucide-react";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { Badge, type BadgeTone } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/features/dashboard/admin-api";
import { getAdminNews } from "@/features/news/admin-api";
import type { AdminNews, NewsStatus } from "@/features/news/types";
import { getPublicOrganization } from "@/features/organization/public-api";
import { relativeTime } from "@/lib/relative-time";

/** `NEWS_STATUS` di Design/admin/assets/admin.js. */
const newsStatus: Record<NewsStatus, [string, BadgeTone]> = {
  published: ["Terbit", "green"],
  draft: ["Draft", "amber"],
  archived: ["Arsip", "grey"],
};

const numberFormat = new Intl.NumberFormat("id-ID");

function StatSkeleton() {
  return (
    <div className="h-[110px] animate-pulse rounded-[4px] border border-line bg-white" />
  );
}

/** Dashboard mengikuti `viewDashboard()` di Design/admin/assets/admin.js. */
export default function DashboardPage() {
  const { admin, can, isSuperadmin } = useAuth();

  const canViewNews = can(PERMISSIONS.NEWS_VIEW);
  const canViewPrograms = can(PERMISSIONS.PROGRAMS_VIEW);
  const canViewOrganization = can(PERMISSIONS.ORGANIZATION_VIEW);
  const canViewVisitors = can(PERMISSIONS.VISITOR_LOGS_VIEW);
  const canCreateNews = can(PERMISSIONS.NEWS_CREATE);
  const canManageOrganization = can(PERMISSIONS.ORGANIZATION_MANAGE);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latest, setLatest] = useState<AdminNews[]>([]);
  const [periodName, setPeriodName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!admin) return;

    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const [statsResult, newsResult, organization] = await Promise.all([
          getDashboardStats({ signal }),
          canViewNews
            ? getAdminNews({ limit: 5 }, { signal })
            : Promise.resolve(null),
          getPublicOrganization({ signal }).catch(() => null),
        ]);

        if (signal.aborted) return;

        setStats(statsResult);
        setLatest(newsResult?.items ?? []);
        setPeriodName(organization?.period?.name ?? null);
      } catch (loadError) {
        if (signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Data dashboard gagal dimuat.",
        );
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [admin, canViewNews, reloadKey]);

  if (!admin) return null;

  const statCards = stats
    ? [
        canViewNews && {
          href: "/admin/news",
          label: "Publikasi",
          value: stats.news_total,
          icon: <FileText />,
        },
        canViewPrograms && {
          href: "/admin/programs",
          label: "Program kerja",
          value: stats.programs_total,
          icon: <ListChecks />,
        },
        canViewOrganization && {
          href: "/admin/organization",
          label: "Anggota (semua periode)",
          value: stats.members_total,
          icon: <Users />,
        },
        canViewVisitors && {
          href: "/admin/visitor-logs",
          label: "Kunjungan",
          value: stats.visitors_total,
          icon: <BarChart3 />,
        },
      ].filter((card) => card !== false)
    : [];

  const quickActions = [
    canCreateNews && { href: "/admin/news/new", label: "Tulis publikasi" },
    canManageOrganization && {
      href: "/admin/organization",
      label: "Tambah anggota",
    },
  ].filter((action) => action !== false);

  return (
    <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
      <AdminPage>
        {/* `.hero-card` */}
        <section className="relative mb-4 flex flex-wrap items-end justify-between gap-6 overflow-hidden rounded-[4px] bg-green-950 px-7 py-[26px] text-white after:absolute after:-top-[60px] after:-right-[60px] after:size-60 after:rounded-full after:border after:border-line-on-dark after:shadow-[0_0_0_40px_rgba(28,61,49,0.25),0_0_0_80px_rgba(28,61,49,0.15)]">
          <div className="relative z-10">
            <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-on-dark-muted uppercase">
              {periodName ? `Periode aktif ${periodName}` : "Belum ada periode aktif"}
            </p>
            <h1 className="mt-2.5 font-serif text-[26px] leading-[1.25] font-bold text-white">
              Selamat datang, {admin.username}
            </h1>
            <p className="mt-1.5 text-on-dark-muted">
              Anda masuk sebagai{" "}
              <strong className="text-white">
                {isSuperadmin ? "Superadmin" : "Admin"}
              </strong>
              .
            </p>
          </div>

          {quickActions.length > 0 ? (
            <div className="relative z-10 flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border px-4 text-[11.5px] leading-none font-semibold tracking-[0.08em] uppercase no-underline transition-colors [&_svg]:size-[15px] ${
                    index === 0
                      ? "border-transparent bg-white text-green-900 hover:bg-mint"
                      : "border-white/35 bg-transparent text-white hover:border-white hover:bg-white/5"
                  }`}
                >
                  <Plus aria-hidden="true" />
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        {error ? (
          <Card>
            <StateBlock
              tone="error"
              icon={<TriangleAlert />}
              label="Gagal memuat"
              title="Data dashboard tidak dapat ditampilkan"
              action={
                <Button
                  variant="outline"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  Coba lagi
                </Button>
              }
            >
              {error}
            </StateBlock>
          </Card>
        ) : (
          <>
            {/* `.grid--stats` */}
            <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
              {isLoading
                ? [0, 1, 2, 3].map((item) => <StatSkeleton key={item} />)
                : statCards.map((card) => (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="block rounded-[4px] border border-line bg-white px-[18px] pt-[18px] pb-4 no-underline transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_8px_22px_rgba(6,38,27,0.06)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-muted-light uppercase">
                          {card.label}
                        </span>
                        <span className="grid size-8 place-items-center rounded-full bg-mint text-green-800 [&_svg]:size-4">
                          {card.icon}
                        </span>
                      </div>
                      <div className="mt-4 font-serif text-[30px] leading-[1.1] font-bold text-green-900">
                        {numberFormat.format(card.value)}
                      </div>
                    </Link>
                  ))}
            </div>

            {canViewNews ? (
              <Card
                title="Publikasi terbaru"
                bodyClassName="p-0"
                action={
                  <ButtonLink href="/admin/news" variant="ghost" size="sm">
                    Lihat semua
                  </ButtonLink>
                }
              >
                {isLoading ? (
                  <div className="space-y-3 p-5">
                    {[0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-10 animate-pulse rounded bg-green-900/5"
                      />
                    ))}
                  </div>
                ) : latest.length === 0 ? (
                  <StateBlock
                    icon={<FileText />}
                    title="Belum ada publikasi"
                    action={
                      canCreateNews ? (
                        <ButtonLink href="/admin/news/new">Tulis publikasi</ButtonLink>
                      ) : undefined
                    }
                  >
                    Publikasi pertama akan muncul di sini.
                  </StateBlock>
                ) : (
                  <ul className="m-0 list-none p-0">
                    {latest.map((news) => {
                      const [statusLabel, statusTone] = newsStatus[news.status];

                      return (
                        <li
                          key={news.id}
                          className="flex items-start gap-3 border-b border-line px-5 py-3 last:border-b-0"
                        >
                          <span className="grid size-[30px] shrink-0 place-items-center rounded-full border border-line bg-mint-50 text-green-800 [&_svg]:size-3.5">
                            <FileText aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              href={`/admin/news/${news.id}`}
                              className="font-medium text-ink no-underline hover:text-green-800 hover:underline"
                            >
                              {news.title}
                            </Link>
                            <div className="mt-0.5 text-xs text-muted">
                              Diperbarui {relativeTime(news.updated_at)}
                            </div>
                          </div>
                          <Badge tone={statusTone}>{statusLabel}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            ) : null}
          </>
        )}
      </AdminPage>
    </RequirePermission>
  );
}
```

## Cek di browser
- `/admin/news`: cari judul, filter Terbit/Draft/Arsip, filter tag, pindah halaman (bila >10).
- **Tulis publikasi** → klik Simpan draft dalam keadaan kosong (harus muncul galat) → isi judul + isi → Simpan draft → pindah otomatis ke halaman Edit dan galeri terbuka.
- Di halaman Edit: tab **Pratinjau**, tombol B/I/H2/daftar, pilih tag, buat tag baru, **Simpan perubahan**, lalu **Simpan & terbitkan**.
- Galeri: unggah 2 gambar, ubah urutan (panah dan seret), ubah keterangan lalu klik di luar kolom, hapus satu gambar.
- Ubah judul lalu klik **Kembali** → harus muncul dialog "Tinggalkan halaman ini?".
- Buka publikasi yang Terbit di situs (`/publikasi/<slug>`): subjudul, daftar, kutipan, dan tautan tampil rapi; berita lama (teks polos) tetap tampil seperti sebelumnya.
- Ulangi daftar dan editor di lebar 375px.

## Commit
```powershell
git add frontend/lib/markdown.tsx frontend/components/admin frontend/features/news "frontend/app/(private)/(admin)/admin"
git status
git commit -m "feat(admin): ADM-2 publikasi — daftar, editor Markdown, tag, galeri"
git push origin feat/admin-ui-foundation
```

Pastikan `git status` sesudah `git add` hanya berisi 18 file di atas (11 baru + 7 diubah).
