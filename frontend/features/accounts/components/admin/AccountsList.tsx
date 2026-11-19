import { Can } from "@/components/admin/shared/Can";
import { PERMISSIONS } from "@/features/auth/permissions";

import { formatAdminLastLogin, summarizeAccountPermissions } from "../../format";

import {
  accountsActionClass,
  accountsDangerActionClass,
  accountsPrimaryActionClass,
  AccountRoleBadge,
  AccountStatusBadge,
  AccountsNotice,
} from "./AccountsPrimitives";

import type {
  AdminAccount,
  PermissionCatalogResponse,
} from "../../types";

interface AccountsListProps {
  items: AdminAccount[];
  catalog: PermissionCatalogResponse | null;
  currentAdminId: number;
  isLoading: boolean;
  error: string;
  actionsDisabledReason?: string;
  onReload: () => void;
  onCreate: () => void;
  onEdit: (account: AdminAccount) => void;
  onResetPassword: (account: AdminAccount) => void;
  onDelete: (account: AdminAccount) => void;
}

export default function AccountsList({
  items,
  catalog,
  currentAdminId,
  isLoading,
  error,
  actionsDisabledReason,
  onReload,
  onCreate,
  onEdit,
  onResetPassword,
  onDelete,
}: AccountsListProps) {
  return (
    <section aria-labelledby="account-list-title" className="mt-6">
      <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="account-list-title"
            className="font-serif text-lg font-semibold text-bg-dark"
          >
            Daftar akun
          </h2>

          <p
            aria-live="polite"
            className="mt-1 text-xs leading-5 text-ink-soft"
          >
            {isLoading
              ? "Memuat akun administrator..."
              : `${items.length} akun administrator`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={onReload}
            disabled={isLoading}
            className={accountsActionClass}
          >
            Muat ulang
          </button>

          <Can permission={PERMISSIONS.ADMINS_MANAGE}>
            <button
              type="button"
              onClick={onCreate}
              disabled={isLoading || Boolean(actionsDisabledReason)}
              title={actionsDisabledReason}
              className={accountsPrimaryActionClass}
            >
              Tambah akun
            </button>
          </Can>
        </div>
      </div>

      <div
        aria-busy={isLoading}
        className="border border-paper-line bg-bg-light"
      >
        {isLoading ? (
          <div className="space-y-4 p-6" role="status">
            <p className="text-sm text-ink-soft">
              Memuat daftar akun administrator...
            </p>

            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse bg-bg-light-2 motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="px-5 py-8">
            <h3 className="text-sm font-semibold">
              Akun administrator belum dapat dimuat
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>

            <button
              type="button"
              onClick={onReload}
              className={`${accountsActionClass} mt-4`}
            >
              Coba lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <h3 className="font-serif text-lg font-semibold text-bg-dark">
              Belum ada akun administrator
            </h3>

            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Tambahkan akun untuk pengurus yang membantu mengelola situs.
            </p>

            <Can permission={PERMISSIONS.ADMINS_MANAGE}>
              <button
                type="button"
                onClick={onCreate}
                disabled={Boolean(actionsDisabledReason)}
                title={actionsDisabledReason}
                className={`${accountsPrimaryActionClass} mt-5`}
              >
                Tambah akun
              </button>
            </Can>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-175 border-collapse text-left">
              <thead className="border-b border-paper-line bg-bg-light-2">
                <tr className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  <th scope="col" className="px-5 py-3">
                    Akun
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Status
                  </th>
                  <th scope="col" className="px-5 py-3">
                    Login terakhir
                  </th>
                  <Can permission={PERMISSIONS.ADMINS_MANAGE}>
                    <th scope="col" className="px-5 py-3">
                      Aksi
                    </th>
                  </Can>
                </tr>
              </thead>

              <tbody className="divide-y divide-paper-line">
                {items.map((account) => {
                  const isSelf = account.id === currentAdminId;

                  return (
                    <tr
                      key={account.id}
                      className="align-top transition-colors hover:bg-bg-light-2/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-bg-dark">
                            {account.username}
                          </p>

                          {isSelf && (
                            <span className="border border-paper-line bg-bg-light-2 px-2 py-0.5 text-xs font-medium text-ink-soft">
                              Anda
                            </span>
                          )}
                        </div>

                        <div className="mt-1.5">
                          {account.is_superadmin ? (
                            <AccountRoleBadge superadmin />
                          ) : (
                            <p className="text-xs leading-5 text-ink-soft">
                              {summarizeAccountPermissions(account, catalog)}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <AccountStatusBadge active={account.is_active} />
                      </td>

                      <td className="px-5 py-4 text-sm text-ink">
                        {formatAdminLastLogin(account.last_login_at)}
                      </td>

                      <Can permission={PERMISSIONS.ADMINS_MANAGE}>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(account)}
                              disabled={Boolean(actionsDisabledReason)}
                              title={actionsDisabledReason}
                              className={accountsActionClass}
                            >
                              Ubah
                            </button>

                            {!isSelf && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => onResetPassword(account)}
                                  className={accountsActionClass}
                                >
                                  Reset password
                                </button>

                                <button
                                  type="button"
                                  onClick={() => onDelete(account)}
                                  className={accountsDangerActionClass}
                                >
                                  Hapus
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </Can>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {actionsDisabledReason && !isLoading && !error && (
        <div className="mt-3">
          <AccountsNotice tone="warning">
            {actionsDisabledReason}
          </AccountsNotice>
        </div>
      )}
    </section>
  );
}
