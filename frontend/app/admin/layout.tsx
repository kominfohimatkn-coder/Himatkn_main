"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { admin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !admin) {
      router.replace("/login");
    }
  }, [admin, isLoading, router]);

  if (isLoading) {
    return (
      <main>
        <p>Memuat...</p>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  return <>{children}</>;
}