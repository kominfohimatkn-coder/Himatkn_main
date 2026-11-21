import type { ReactNode } from "react";

/**
 * Pembungkus isi halaman admin, mengikuti `.content` di Design/admin:
 * padding 32px 32px 64px, lebar maksimum 1240px (≤900px: 22px 16px 80px).
 */
export function AdminPage({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[1240px] px-4 pt-[22px] pb-20 min-[901px]:px-8 min-[901px]:pt-8 min-[901px]:pb-16">
      {children}
    </div>
  );
}