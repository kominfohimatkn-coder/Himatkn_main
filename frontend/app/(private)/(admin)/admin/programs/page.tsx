"use client";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { PERMISSIONS } from "@/features/auth/permissions";
import ProgramsList from "@/features/programs/components/admin/ProgramsList";

export default function ProgramsPage() {
  return (
    <RequirePermission permission={PERMISSIONS.PROGRAMS_VIEW}>
      <AdminPage>
        <ProgramsList />
      </AdminPage>
    </RequirePermission>
  );
}