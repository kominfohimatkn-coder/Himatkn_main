"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/AuthContext";
import { AdminShell } from "@/components/admin/shell/AdminShell";

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
      <main className="admin-theme flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Memuat...</p>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}