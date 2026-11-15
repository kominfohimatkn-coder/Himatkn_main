import type { Metadata } from "next";
import {
  Inter,
  JetBrains_Mono,
  Literata,
  Playfair_Display,
} from "next/font/google";

import "./globals.css";

/**
 * Font publik mengikuti Prototype Desain HIMATKN V1:
 * Literata (serif/judul) + Inter (sans/UI).
 * Playfair Display + Inter dipertahankan untuk scope admin (.admin-theme).
 * JetBrains Mono dipertahankan karena masih dirujuk admin (`font-mono`) dan
 * label teknis di halaman publik yang belum dimigrasikan (R2).
 */
const literata = Literata({
  variable: "--font-literata",
  subsets: ["latin"],
  weight: ["600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.himatknuklir.web.id"),

  title: {
    default: "HIMATKN — Himpunan Mahasiswa Teknokimia Nuklir",
    template: "%s | HIMATKN",
  },

  description:
    "Website resmi HIMATKN, himpunan mahasiswa Teknokimia Nuklir.",

  keywords: [
    "HIMATKN",
    "Himpunan Mahasiswa Teknokimia Nuklir",
    "Teknokimia Nuklir",
  ],

  authors: [{ name: "HIMATKN" }],
  creator: "HIMATKN",
  publisher: "HIMATKN",

  openGraph: {
    title: "HIMATKN — Himpunan Mahasiswa Teknokimia Nuklir",
    description:
      "Website resmi HIMATKN, himpunan mahasiswa Teknokimia Nuklir.",
    url: "https://www.himatknuklir.web.id",
    siteName: "HIMATKN",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${literata.variable} ${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
