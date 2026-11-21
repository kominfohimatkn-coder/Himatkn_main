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