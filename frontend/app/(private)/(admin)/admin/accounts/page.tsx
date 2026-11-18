"use client";

import { useEffect, useState } from "react";

import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  getAdminPermissionCatalog,
  updateAdminAccount,
} from "@/features/accounts/api";
import AccountDeleteDialog from "@/features/accounts/components/admin/AccountDeleteDialog";
import AccountFormDialog from "@/features/accounts/components/admin/AccountFormDialog";
import AccountPasswordResetDialog from "@/features/accounts/components/admin/AccountPasswordResetDialog";
import AccountsList from "@/features/accounts/components/admin/AccountsList";
import {
  accountsActionClass,
  AccountsNotice,
} from "@/features/accounts/components/admin/AccountsPrimitives";
import { useAuth } from "@/features/auth/AuthContext";
import { getApiErrorMessage } from "@/lib/api/errors";

import type { AccountFormValues } from "@/features/accounts/components/admin/AccountFormDialog";
import type {
  AdminAccount,
  AdminAccountUpdatePayload,
  PermissionCatalogResponse,
} from "@/features/accounts/types";

interface AccountFormTarget {
  account?: AdminAccount;
}

export default function AccountsPage() {
  const { admin, isSuperadmin } = useAuth();

  const canView = isSuperadmin;

  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState("");
  const [accountsRefreshKey, setAccountsRefreshKey] = useState(0);

  const [catalog, setCatalog] = useState<PermissionCatalogResponse | null>(
    null,
  );
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [catalogRefreshKey, setCatalogRefreshKey] = useState(0);

  const [notice, setNotice] = useState("");

  const [formTarget, setFormTarget] = useState<AccountFormTarget | null>(
    null,
  );
  const [resetTarget, setResetTarget] = useState<AdminAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminAccount | null>(
    null,
  );

  useEffect(() => {
    if (!canView) return;

    const controller = new AbortController();

    void getAdminAccounts({ signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;

        setAccounts(result.items);
        setAccountsError("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        setAccountsError(
          getApiErrorMessage(err, "Daftar akun gagal dimuat."),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setAccountsLoading(false);
        }
      });

    return () => controller.abort();
  }, [canView, accountsRefreshKey]);

  useEffect(() => {
    if (!canView) return;

    const controller = new AbortController();

    void getAdminPermissionCatalog({ signal: controller.signal })
      .then((result) => {
        if (controller.signal.aborted) return;

        setCatalog(result);
        setCatalogError("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        setCatalog(null);
        setCatalogError(
          getApiErrorMessage(err, "Katalog izin gagal dimuat."),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setCatalogLoading(false);
        }
      });

    return () => controller.abort();
  }, [canView, catalogRefreshKey]);

  if (!admin) return null;

  const currentAdminId = admin.id;

  function reloadAccounts() {
    setAccountsError("");
    setAccountsLoading(true);
    setAccountsRefreshKey((current) => current + 1);
  }

  function reloadCatalog() {
    setCatalogError("");
    setCatalogLoading(true);
    setCatalogRefreshKey((current) => current + 1);
  }

  async function saveAccount(values: AccountFormValues) {
    if (formTarget?.account) {
      const account = formTarget.account;
      const isSelf = account.id === currentAdminId;
      const payload: AdminAccountUpdatePayload = {
        username: values.username,
      };

      if (!isSelf) {
        if (values.is_superadmin !== account.is_superadmin) {
          payload.is_superadmin = values.is_superadmin;
        }

        if (values.is_active !== account.is_active) {
          payload.is_active = values.is_active;
        }

        if (!values.is_superadmin) {
          const alwaysGranted = new Set(catalog?.always_granted ?? []);
          const currentPermissions = account.permissions.filter(
            (name) => !alwaysGranted.has(name),
          );
          const permissionsChanged =
            values.permissions.length !== currentPermissions.length ||
            values.permissions.some(
              (name) => !currentPermissions.includes(name),
            );
          const isDemotion =
            account.is_superadmin && !values.is_superadmin;

          if (isDemotion || permissionsChanged) {
            payload.permissions = values.permissions;
          }
        }
      }

      await updateAdminAccount(account.id, payload);
      setNotice("Akun administrator diperbarui.");
    } else {
      await createAdminAccount({
        username: values.username,
        password: values.password ?? "",
        is_superadmin: values.is_superadmin,
        permissions: values.is_superadmin ? undefined : values.permissions,
      });
      setNotice("Akun administrator ditambahkan.");
    }

    reloadAccounts();
  }

  async function resetAccountPassword(password: string) {
    if (!resetTarget) return;

    await updateAdminAccount(resetTarget.id, { password });
    setNotice(
      "Password direset. Semua sesi akun ini telah diakhiri.",
    );
    reloadAccounts();
  }

  async function removeAccount() {
    if (!deleteTarget) return;

    await deleteAdminAccount(deleteTarget.id);
    setNotice("Akun administrator dihapus.");
    reloadAccounts();
  }

  function openCreateDialog() {
    setNotice("");
    setFormTarget({});
  }

  function openEditDialog(account: AdminAccount) {
    setNotice("");
    setFormTarget({ account });
  }

  const actionsDisabledReason = catalog
    ? undefined
    : catalogLoading
      ? "Katalog izin sedang dimuat. Tambah dan ubah akun dinonaktifkan sementara."
      : "Katalog izin belum dapat dimuat, sehingga tambah dan ubah akun dinonaktifkan.";

  return (
    <RequirePermission superadminOnly>
      <main className="min-h-screen bg-bg-light text-ink">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <header className="border-b border-paper-line pb-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">
              Sistem / Administrator
            </p>

            <h1 className="mt-3 font-serif text-3xl font-semibold text-bg-dark sm:text-4xl">
              Administrator
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Kelola akun yang dapat masuk ke panel admin, status aktif, izin
              per akun, dan reset kata sandi.
            </p>
          </header>

          {notice && (
            <div className="mt-5">
              <AccountsNotice tone="success">{notice}</AccountsNotice>
            </div>
          )}

          {catalogError && (
            <div className="mt-5">
              <AccountsNotice tone="error">
                <p className="font-medium">Katalog izin belum dapat dimuat</p>
                <p className="mt-1">{catalogError}</p>

                <button
                  type="button"
                  onClick={reloadCatalog}
                  className={`${accountsActionClass} mt-3`}
                >
                  Coba lagi
                </button>
              </AccountsNotice>
            </div>
          )}

          <AccountsList
            items={accounts}
            catalog={catalog}
            currentAdminId={currentAdminId}
            isLoading={accountsLoading}
            error={accountsError}
            actionsDisabledReason={actionsDisabledReason}
            onReload={reloadAccounts}
            onCreate={openCreateDialog}
            onEdit={openEditDialog}
            onResetPassword={(account) => {
              setNotice("");
              setResetTarget(account);
            }}
            onDelete={(account) => {
              setNotice("");
              setDeleteTarget(account);
            }}
          />

          {formTarget && catalog && (
            <AccountFormDialog
              key={formTarget.account?.id ?? "create"}
              account={formTarget.account}
              catalog={catalog}
              isSelf={formTarget.account?.id === currentAdminId}
              onClose={() => setFormTarget(null)}
              onSubmit={saveAccount}
            />
          )}

          {resetTarget && (
            <AccountPasswordResetDialog
              key={resetTarget.id}
              account={resetTarget}
              onClose={() => setResetTarget(null)}
              onSubmit={resetAccountPassword}
            />
          )}

          {deleteTarget && (
            <AccountDeleteDialog
              key={deleteTarget.id}
              account={deleteTarget}
              onClose={() => setDeleteTarget(null)}
              onConfirm={removeAccount}
            />
          )}
        </div>
      </main>
    </RequirePermission>
  );
}
