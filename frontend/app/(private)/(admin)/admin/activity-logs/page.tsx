"use client";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import ActivityLogList from "@/features/activity/components/admin/ActivityLogList";
import { PERMISSIONS } from "@/features/auth/permissions";

export default function ActivityLogsPage() {
  return (
    <RequirePermission permission={PERMISSIONS.ACTIVITY_LOGS_VIEW}>
      <AdminPage>
        <ActivityLogList />
      </AdminPage>
    </RequirePermission>
  );
}