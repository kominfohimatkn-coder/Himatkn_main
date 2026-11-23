import type { ReactNode } from "react";

/**
 * `template` dibuat ulang di setiap perpindahan halaman, jadi isi halaman
 * memudar masuk tiap kali pengunjung pindah halaman (`page-in` di prototipe).
 * Header dan footer ada di layout, jadi tetap diam.
 */
export default function PublicTemplate({ children }: { children: ReactNode }) {
  return <div className="motion-safe:animate-page-in">{children}</div>;
}