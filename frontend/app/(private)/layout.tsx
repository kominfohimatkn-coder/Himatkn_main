import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/AuthContext";

/** Login dan panel admin tidak boleh muncul di hasil pencarian. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PrivateLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AuthProvider>{children}</AuthProvider>;
}