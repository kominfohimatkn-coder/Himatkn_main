"use client";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { PERMISSIONS } from "@/features/auth/permissions";
import { NewsEditor } from "@/features/news/components/admin/NewsEditor";

export default function NewNewsPage() {
  return (
    <RequirePermission permission={PERMISSIONS.NEWS_CREATE}>
      <AdminPage>
        <NewsEditor newsId={null} />
      </AdminPage>
    </RequirePermission>
  );
}