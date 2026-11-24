"use client";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import AccountsList from "@/features/accounts/components/admin/AccountsList";

export default function AccountsPage() {
  return (
    <RequirePermission superadminOnly>
      <AdminPage>
        <AccountsList />
      </AdminPage>
    </RequirePermission>
  );
}