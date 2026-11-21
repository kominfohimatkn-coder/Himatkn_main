"use client";

import { useParams } from "next/navigation";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { PERMISSIONS } from "@/features/auth/permissions";
import { NewsEditor } from "@/features/news/components/admin/NewsEditor";

export default function EditNewsPage() {
  const { id } = useParams<{ id: string }>();
  const newsId = Number(id);

  return (
    <RequirePermission permission={PERMISSIONS.NEWS_VIEW}>
      <AdminPage>
        {/* key: editor dimuat ulang bersih saat pindah dari /new ke /[id]. */}
        <NewsEditor key={id} newsId={Number.isInteger(newsId) && newsId > 0 ? newsId : -1} />
      </AdminPage>
    </RequirePermission>
  );
}