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