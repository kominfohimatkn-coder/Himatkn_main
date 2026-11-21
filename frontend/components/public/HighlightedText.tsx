/**
 * Menyorot kemunculan pertama kata kunci mengikuti helper `mark()` pada
 * prototype (`Design/assets/app.js`): pencarian tidak peka huruf besar/kecil
 * dan diakritik. Tidak memakai `dangerouslySetInnerHTML`; teks dipecah menjadi
 * tiga bagian dan dibungkus `<mark>`.
 */
type HighlightedTextProps = {
  text: string;
  term?: string | null;
};

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function HighlightedText({ text, term }: HighlightedTextProps) {
  const needle = term?.trim();

  if (!needle) return <>{text}</>;

  const index = normalize(text).indexOf(normalize(needle));

  if (index < 0) return <>{text}</>;

  const end = index + needle.length;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded-[2px] bg-amber/18 px-0.5 text-inherit">
        {text.slice(index, end)}
      </mark>
      {text.slice(end)}
    </>
  );
}
