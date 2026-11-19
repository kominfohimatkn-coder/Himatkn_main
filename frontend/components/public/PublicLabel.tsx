/**
 * Label kecil publik mengikuti `.label` di Prototype V1 (Inter, kapital,
 * letter-spacing lebar). Dipisah dari `.kicker` lama karena kelas itu masih
 * memakai JetBrains Mono untuk halaman /struktur (R2).
 */
type PublicLabelProps = {
  tone?: "light" | "dark";
  className?: string;
  children: React.ReactNode;
};

const toneClasses = {
  light: "text-green-700",
  dark: "text-on-dark-soft",
} as const;

export function PublicLabel({
  tone = "light",
  className = "",
  children,
}: PublicLabelProps) {
  return (
    <p
      className={`text-xs font-semibold tracking-widest uppercase ${toneClasses[tone]} ${className}`.trim()}
    >
      {children}
    </p>
  );
}
