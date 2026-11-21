import { PlainTextBody } from "@/components/public/PlainTextBody";

/**
 * Isi publikasi saat ini dirender sebagai teks polos: baris kosong menjadi
 * paragraf dan newline tunggal menjadi `<br>` (lihat `PlainTextBody`).
 * Dukungan Markdown akan ditambahkan di batch admin publikasi; sampai saat
 * itu jangan memakai `dangerouslySetInnerHTML`.
 */
export function NewsContent({ content }: { content: string | null }) {
  return <PlainTextBody text={content} />;
}
