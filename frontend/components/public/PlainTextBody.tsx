/**
 * Menampilkan teks polos sebagai paragraf. Baris kosong memisahkan paragraf;
 * newline tunggal di dalam paragraf dirender sebagai `<br>` lewat
 * `whitespace-pre-line`. Tidak ada HTML yang dieksekusi.
 */
function splitParagraphs(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function PlainTextBody({ text }: { text: string | null }) {
  const paragraphs = text ? splitParagraphs(text) : [];

  if (paragraphs.length === 0) return null;

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p
          key={`${index}-${paragraph.slice(0, 24)}`}
          className="mb-5 text-[17px] leading-[1.8] whitespace-pre-line text-[#2A3530]"
        >
          {paragraph}
        </p>
      ))}
    </>
  );
}
