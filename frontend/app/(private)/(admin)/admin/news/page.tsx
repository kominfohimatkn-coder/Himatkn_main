"use client";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { PERMISSIONS } from "@/features/auth/permissions";
import NewsList from "@/features/news/components/admin/NewsList";

export default function NewsPage() {
  return (
    <RequirePermission permission={PERMISSIONS.NEWS_VIEW}>
      <AdminPage>
        <NewsList />
      </AdminPage>
    </RequirePermission>
  );
}