import { Markdown } from "@/lib/markdown";

/**
 * Isi publikasi dirender dari Markdown (lihat `lib/markdown.tsx`): elemen
 * React biasa, tanpa `dangerouslySetInnerHTML`. Isi lama berupa teks polos
 * tetap tampil sebagai paragraf.
 */
export function NewsContent({ content }: { content: string | null }) {
  return <Markdown source={content} variant="public" />;
}