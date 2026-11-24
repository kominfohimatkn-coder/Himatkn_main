/** Dua huruf awal username, contoh: `pengurus.minfo` → `PM`. */
export function initials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part.charAt(0));
  return (letters.join("") || "A").toUpperCase();
}

const sizes = {
  md: "size-[34px] text-xs",
  xl: "size-14 text-lg",
};

/** Lingkaran inisial, mengikuti `.avatar` / `.avatar--off` / `.avatar--xl` di Design/admin. */
export function Avatar({
  name,
  off = false,
  size = "md",
}: {
  name: string;
  /** Abu-abu untuk akun nonaktif. */
  off?: boolean;
  size?: keyof typeof sizes;
}) {
  return (
    <span
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full font-bold ${sizes[size]} ${
        off ? "bg-[#dce5e0] text-muted" : "bg-green-800 text-white"
      }`}
    >
      {initials(name)}
    </span>
  );
}