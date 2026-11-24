"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Pencil, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";

import { Avatar } from "@/components/admin/shared/Avatar";
import { Badge } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { MobileList, MobileRow, Table, Td, Th, Tr } from "@/components/admin/shared/DataTable";
import { Notice } from "@/components/admin/shared/Notice";
import { PageHead } from "@/components/admin/shared/PageHead";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { useToast } from "@/components/admin/shared/Toast";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { getApiErrorMessage } from "@/lib/api/errors";

import {
  createAdminAccount,
  deleteAdminAccount,
  getAdminAccounts,
  getAdminPermissionCatalog,
  updateAdminAccount,
} from "../../api";
import {
  formatAdminLastLogin,
  formatAdminLastLoginShort,
  summarizeAccountPermissions,
} from "../../format";

import AccountFormDialog, { type AccountFormValues } from "./AccountFormDialog";

import type {
  AdminAccount,
  AdminAccountUpdatePayload,
  PermissionCatalogResponse,
} from "../../types";

const AccessBadge = ({ superadmin }: { superadmin: boolean }) =>
  superadmin ? <Badge tone="green">Superadmin</Badge> : <Badge tone="outline">Pengurus</Badge>;

/**
 * Halaman Administrator, mengikuti `viewAdmins()` di Design/admin.
 * Backend memakai izin per akun (bukan role tetap), jadi kolom "Akses"
 * menampilkan Superadmin atau ringkasan modul yang diizinkan.
 * Semua pemakai halaman ini superadmin, sehingga semuanya boleh mengelola.
 */
export default function AccountsList() {
  const { admin } = useAuth();
  const toast = useToast();
  const myId = admin?.id;

  const [accounts, setAccounts] = useState<AdminAccount[] | null>(null);
  const [catalog, setCatalog] = useState<PermissionCatalogResponse | null>(null);
  const [error, setError] = useState("");
  const [catalogError, setCatalogError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [formTarget, setFormTarget] = useState<{ account?: AdminAccount } | null>(null);
  const [deleting, setDeleting] = useState<AdminAccount | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      getAdminAccounts({ signal: controller.signal }),
      getAdminPermissionCatalog({ signal: controller.signal }).catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setCatalogError(getApiErrorMessage(err, "Katalog izin gagal dimuat."));
        }
        return null;
      }),
    ])
      .then(([result, catalogResult]) => {
        setAccounts(result.items);
        setCatalog(catalogResult);
        if (catalogResult) setCatalogError("");
        setError("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(err, "Daftar administrator gagal dimuat."));
      });

    return () => controller.abort();
  }, [reloadKey]);

  /** Akun sendiri di atas, lalu aktif, superadmin, dan urut username. */
  const rows = useMemo(
    () =>
      [...(accounts ?? [])].sort(
        (a, b) =>
          Number(b.id === myId) - Number(a.id === myId) ||
          Number(b.is_active) - Number(a.is_active) ||
          Number(b.is_superadmin) - Number(a.is_superadmin) ||
          a.username.localeCompare(b.username),
      ),
    [accounts, myId],
  );

  function reload() {
    setReloadKey((key) => key + 1);
  }

  /** Hanya field yang berubah yang dikirim (logika sama dengan halaman lama). */
  async function saveAccount(values: AccountFormValues) {
    const account = formTarget?.account;

    if (!account) {
      await createAdminAccount({
        username: values.username,
        password: values.password ?? "",
        is_superadmin: values.is_superadmin,
        permissions: values.is_superadmin ? undefined : values.permissions,
      });
      toast("Administrator ditambahkan.");
      reload();
      return;
    }

    const isSelf = account.id === myId;
    const payload: AdminAccountUpdatePayload = { username: values.username };

    if (!isSelf) {
      if (values.password) payload.password = values.password;
      if (values.is_superadmin !== account.is_superadmin) payload.is_superadmin = values.is_superadmin;
      if (values.is_active !== account.is_active) payload.is_active = values.is_active;

      if (!values.is_superadmin) {
        const alwaysGranted = new Set(catalog?.always_granted ?? []);
        const current = account.permissions.filter((name) => !alwaysGranted.has(name));
        const changed =
          values.permissions.length !== current.length ||
          values.permissions.some((name) => !current.includes(name));

        if (account.is_superadmin || changed) payload.permissions = values.permissions;
      }
    }

    await updateAdminAccount(account.id, payload);
    toast(payload.password ? "Administrator diperbarui. Semua sesinya diakhiri." : "Administrator diperbarui.");
    reload();
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");

    try {
      await deleteAdminAccount(deleting.id);
      setAccounts((current) => current?.filter((account) => account.id !== deleting.id) ?? null);
      setDeleting(null);
      setFormTarget(null);
      toast("Administrator dihapus.");
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, "Administrator gagal dihapus."));
    } finally {
      setDeleteBusy(false);
    }
  }

  function askDelete(account: AdminAccount) {
    setDeleteError("");
    setDeleting(account);
  }

  const canEdit = Boolean(catalog);

  let body;
  if (error) {
    body = (
      <StateBlock
        tone="error"
        icon={<RefreshCw />}
        label="Gagal memuat"
        title="Administrator tidak dapat dimuat"
        action={
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setAccounts(null);
              reload();
            }}
          >
            <RefreshCw aria-hidden="true" /> Coba lagi
          </Button>
        }
      >
        {error}
      </StateBlock>
    );
  } else if (accounts === null) {
    body = (
      <div role="status" aria-label="Memuat administrator" className="grid gap-4 p-4">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex animate-pulse items-center gap-3">
            <div className="size-[34px] rounded-full bg-green-900/5" />
            <div className="grid flex-1 gap-2">
              <div className="h-3 w-2/5 rounded-[3px] bg-green-900/5" />
              <div className="h-2.5 w-1/4 rounded-[3px] bg-green-900/5" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (rows.length === 0) {
    body = (
      <StateBlock
        icon={<ShieldCheck />}
        label="Administrator"
        title="Belum ada administrator lain"
        action={
          canEdit ? <Button onClick={() => setFormTarget({})}>Tambah administrator</Button> : undefined
        }
      >
        Tambahkan akun untuk pengurus yang membantu mengelola situs.
      </StateBlock>
    );
  } else {
    body = (
      <>
        <Table
          className="max-[640px]:hidden"
          head={
            <>
              <Th>Administrator</Th>
              <Th>Akses</Th>
              <Th>Status</Th>
              <Th>Login terakhir</Th>
              <Th>
                <span className="sr-only">Aksi</span>
              </Th>
            </>
          }
        >
          {rows.map((account) => {
            const isSelf = account.id === myId;

            return (
              <Tr key={account.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <Avatar name={account.username} off={!account.is_active} />
                    <span className="font-semibold text-green-900">{account.username}</span>
                    {isSelf ? <Badge tone="outline">Anda</Badge> : null}
                  </div>
                </Td>
                <Td label="Akses">
                  <AccessBadge superadmin={account.is_superadmin} />
                  {account.is_superadmin ? null : (
                    <div className="mt-1 max-w-[280px] text-xs text-muted">
                      {summarizeAccountPermissions(account, catalog)}
                    </div>
                  )}
                </Td>
                <Td label="Status">
                  {account.is_active ? (
                    <Badge tone="mint" dot>
                      Aktif
                    </Badge>
                  ) : (
                    <Badge tone="grey">Nonaktif</Badge>
                  )}
                </Td>
                <Td label="Login terakhir" className="text-xs">
                  {formatAdminLastLogin(account.last_login_at)}
                </Td>
                <Td actions>
                  <div className="inline-flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!canEdit}
                      onClick={() => setFormTarget({ account })}
                    >
                      <Pencil aria-hidden="true" /> Edit
                    </Button>
                    {isSelf ? null : (
                      <Button
                        variant="danger-outline"
                        size="icon"
                        className="size-8!"
                        aria-label={`Hapus akun ${account.username}`}
                        onClick={() => askDelete(account)}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
        </Table>
        <MobileList>
          {rows.map((account) => (
            <MobileRow
              key={account.id}
              onClick={canEdit ? () => setFormTarget({ account }) : undefined}
              lead={<Avatar name={account.username} off={!account.is_active} />}
              muted={!account.is_active}
              title={
                <>
                  {account.username}
                  {account.id === myId ? (
                    <span className="ml-1.5 align-[1px] text-[10px] font-semibold tracking-[0.06em] text-muted uppercase">
                      (Anda)
                    </span>
                  ) : null}
                </>
              }
              status={<AccessBadge superadmin={account.is_superadmin} />}
              meta={`${account.is_active ? "Aktif" : "Nonaktif"} · ${
                account.last_login_at ? "masuk " : ""
              }${formatAdminLastLoginShort(account.last_login_at)}`}
            />
          ))}
        </MobileList>
      </>
    );
  }

  return (
    <>
      <PageHead
        label="Sistem"
        title="Administrator"
        description="Akun yang dapat masuk ke panel admin. Superadmin maksimal 2 akun."
        actions={
          <Button disabled={!canEdit} onClick={() => setFormTarget({})}>
            <Plus aria-hidden="true" /> Tambah administrator
          </Button>
        }
      />

      {catalogError ? (
        <Notice tone="amber" icon={<AlertTriangle aria-hidden="true" />} className="mb-4">
          <strong>Katalog izin belum dapat dimuat.</strong> Tambah dan ubah akun
          dinonaktifkan sementara. {catalogError}{" "}
          <button
            type="button"
            onClick={reload}
            className="cursor-pointer font-semibold underline underline-offset-2"
          >
            Coba lagi
          </button>
        </Notice>
      ) : null}

      <Card bodyClassName="p-0">{body}</Card>

      {formTarget && catalog ? (
        <AccountFormDialog
          key={formTarget.account?.id ?? "create"}
          account={formTarget.account}
          catalog={catalog}
          isSelf={formTarget.account?.id === myId}
          onDelete={
            formTarget.account && formTarget.account.id !== myId
              ? () => askDelete(formTarget.account as AdminAccount)
              : undefined
          }
          onClose={() => setFormTarget(null)}
          onSubmit={saveAccount}
        />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        eyebrow="Hapus administrator"
        title={`Hapus akun ${deleting?.username ?? ""}?`}
        description="Akun ini tidak bisa login lagi dan semua sesinya diakhiri. Riwayat aktivitasnya tetap tersimpan."
        confirmLabel="Hapus"
        busyLabel="Menghapus..."
        busy={deleteBusy}
        error={deleteError}
        onCancel={() => setDeleting(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}