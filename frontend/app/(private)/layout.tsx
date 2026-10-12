import type { ReactNode } from "react";
import { AuthProvider } from "@/context/AuthContext";

export default function PrivateLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <AuthProvider>{children}</AuthProvider>;
}