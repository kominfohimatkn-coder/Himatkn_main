import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://himatknuklir.vercel.app"),

  title: {
    default: "HIMATKN",
    template: "%s | HIMATKN",
  },

  description: "Website resmi HIMATKN",

  keywords: [
    "HIMATKN",
    "Himpunan Mahasiswa Teknokimia Nuklir",
  ],

  authors: [{ name: "HIMATKN" }],
  creator: "HIMATKN",
  publisher: "HIMATKN",

  openGraph: {
    title: "HIMATKN",
    description: "Website resmi HIMATKN",
    url: "https://himatknuklir.vercel.app",
    siteName: "HIMATKN",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
      },
    ],
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
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans`}
      >
        {children}
        
      </body>
    </html>
  );
}