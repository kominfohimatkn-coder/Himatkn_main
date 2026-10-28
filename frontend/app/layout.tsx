import type { Metadata } from "next";
import {
  Crimson_Text,
  Inter,
  JetBrains_Mono,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";

import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const crimsonText = Crimson_Text({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["600", "700"],
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

export const metadata: Metadata = {
  metadataBase: new URL("https://himatknuklir.vercel.app"),

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
    url: "https://himatknuklir.vercel.app",
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
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${crimsonText.variable} ${inter.variable} ${playfair.variable}`}
    >
      <body className="font-sans">{children}</body>
    </html>
  );
}
