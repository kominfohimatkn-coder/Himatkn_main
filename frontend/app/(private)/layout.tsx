import type { ReactNode } from "react";
import { AuthProvider } from "@/features/auth/AuthContext";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AuthProvider>{children}</AuthProvider>;
}