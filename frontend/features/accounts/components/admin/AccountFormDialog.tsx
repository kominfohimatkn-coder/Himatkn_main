"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { AlertTriangle, Info, ShieldCheck, Trash2 } from "lucide-react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { Notice } from "@/components/admin/shared/Notice";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/api/errors";

import {
  getInitialManualPermissions,
  getPayloadPermissions,
} from "../../permissions";

import PermissionChecklist from "./PermissionChecklist";

import type {
  AdminAccount,
  PermissionCatalogResponse,
} from "../../types";

export interface AccountFormValues {
  username: string;
  /** Wajib saat tambah; saat edit akun lain opsional (kosong = tidak diubah). */
  password?: string;
  is_active: boolean;
  is_superadmin: boolean;
  permissions: string[];
}

interface AccountFormDialogProps {
  account?: AdminAccount;
  catalog: PermissionCatalogResponse;
  isSelf: boolean;
  /** Bila diisi, form edit menampilkan "Zona berbahaya" dengan tombol hapus. */
  onDelete?: () => void;
  onClose: () => void;
  onSubmit: (values: AccountFormValues) => Promise<void>;
}

interface FieldErrors {
  username?: string;
  password?: string;
  confirm?: string;
}

/**
 * Panel tambah/edit administrator, mengikuti `adminForm()` di Design/admin.
 * Reset kata sandi akun lain ada di sini (kolom kata sandi baru saat edit).
 */
export default function AccountFormDialog({
  account,
  catalog,
  isSelf,
  onDelete,
  onClose,
  onSubmit,
}: AccountFormDialogProps) {
  const isNew = !account;
  const [username, setUsername] = useState(account?.username ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isActive, setIsActive] = useState(account?.is_active ?? true);
  const [isSuperadmin, setIsSuperadmin] = useState(account?.is_superadmin ?? false);
  const [manualPermissions, setManualPermissions] = useState<string[]>(() =>
    getInitialManualPermissions(account, catalog),
  );

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const permissionsForSubmit = useMemo(
    () => getPayloadPermissions(manualPermissions, catalog),
    [catalog, manualPermissions],
  );

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const nextErrors: FieldErrors = {};
    const trimmedUsername = username.trim();
    const checkPassword = isNew || (!isSelf && (password || confirm));

    if (!trimmedUsername) {
      nextErrors.username = "Username wajib diisi.";
    } else if (trimmedUsername.length < 3 || trimmedUsername.length > 50) {
      nextErrors.username = "Username harus 3–50 karakter.";
    }

    if (checkPassword) {
      if (!password) {
        nextErrors.password = "Kata sandi wajib diisi.";
      } else if (password.length < 12) {
        nextErrors.password = "Kata sandi minimal 12 karakter.";
      } else if (password.length > 128) {
        nextErrors.password = "Kata sandi maksimal 128 karakter.";
      }

      if (!confirm) {
        nextErrors.confirm = "Ulangi kata sandi.";
      } else if (confirm !== password) {
        nextErrors.confirm = "Tidak sama dengan kata sandi di atas.";
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit({
        username: trimmedUsername,
        password: checkPassword ? password : undefined,
        is_active: isActive,
        is_superadmin: isSuperadmin,
        permissions: isSuperadmin ? [] : permissionsForSubmit,
      });
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, isNew ? "Akun gagal dibuat." : "Akun gagal disimpan."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow="Administrator"
      title={account ? `Edit ${account.username}` : "Tambah administrator"}
      size="lg"
      busy={isSaving}
      onClose={onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="flex min-h-full flex-col">
        <div className="grid flex-1 content-start gap-4 px-6 py-[22px]">
          <FormField
            label="Username"
            hint="3–50 karakter. Harus unik."
            required
            error={fieldErrors.username}
          >
            <Input
              value={username}
              onChange={(event) => {
                setUsername(event.target.value);
                clearFieldError("username");
              }}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              maxLength={50}
              placeholder="contoh: pengurus.minfo"
            />
          </FormField>

          {isSelf ? (
            <Notice icon={<Info aria-hidden="true" />}>
              Status, akses, dan kata sandi akun Anda sendiri tidak diubah dari sini.
              Ganti kata sandi lewat{" "}
              <Link href="/admin/account" className="font-semibold underline underline-offset-2">
                Akun Saya
              </Link>
              .
            </Notice>
          ) : (
            <>
              <div className="grid items-start gap-3.5 min-[641px]:grid-cols-2">
                <FormField
                  label={isNew ? "Kata sandi" : "Kata sandi baru"}
                  hint={isNew ? "Minimal 12 karakter." : "Kosongkan bila tidak diubah."}
                  required={isNew}
                  error={fieldErrors.password}
                >
                  <Input
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      clearFieldError("password");
                    }}
                    autoComplete="new-password"
                    maxLength={128}
                  />
                </FormField>
                <FormField label="Ulangi kata sandi" required={isNew} error={fieldErrors.confirm}>
                  <Input
                    type="password"
                    value={confirm}
                    onChange={(event) => {
                      setConfirm(event.target.value);
                      clearFieldError("confirm");
                    }}
                    autoComplete="new-password"
                    maxLength={128}
                  />
                </FormField>
              </div>

              <div className="grid gap-3 rounded-[4px] border border-line bg-white p-4">
                {isNew ? null : (
                  <Checkbox
                    checked={isActive}
                    disabled={isSaving}
                    onChange={(event) => setIsActive(event.target.checked)}
                    label="Akun aktif"
                    description="Akun nonaktif tidak dapat login dan semua sesinya diakhiri."
                  />
                )}
                <Checkbox
                  checked={isSuperadmin}
                  disabled={isSaving}
                  onChange={(event) => setIsSuperadmin(event.target.checked)}
                  label="Jadikan superadmin"
                  description="Memiliki semua izin, termasuk mengelola administrator. Maksimal 2 akun."
                />
              </div>

              {isSuperadmin ? (
                <Notice icon={<ShieldCheck aria-hidden="true" />}>
                  Superadmin otomatis memiliki semua izin, jadi daftar izin tidak perlu diisi.
                </Notice>
              ) : (
                <PermissionChecklist
                  catalog={catalog}
                  selected={manualPermissions}
                  disabled={isSaving}
                  onChange={setManualPermissions}
                />
              )}

              {isNew ? null : (
                <Notice tone="amber" icon={<AlertTriangle aria-hidden="true" />}>
                  Mengganti kata sandi atau menonaktifkan akun langsung mengakhiri
                  semua sesi login {account?.username}.
                </Notice>
              )}
            </>
          )}

          {onDelete ? (
            <div className="mt-2 border-t border-line pt-[18px]">
              <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-danger uppercase">
                Zona berbahaya
              </p>
              <p className="mt-1.5 mb-3 text-[13px] text-muted">
                Akun yang dihapus tidak bisa login lagi. Riwayat aktivitasnya tetap tersimpan.
              </p>
              <Button variant="danger-outline" onClick={onDelete} disabled={isSaving}>
                <Trash2 aria-hidden="true" /> Hapus akun {account?.username}
              </Button>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-[4px] border border-[#ebcfc6] bg-danger-bg px-3.5 py-3 text-[13px] text-danger">
              {error}
            </p>
          ) : null}
        </div>

        <footer className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-white px-6 py-3.5">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Batal
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Menyimpan..." : isNew ? "Tambah administrator" : "Simpan perubahan"}
          </Button>
        </footer>
      </form>
    </FormDialog>
  );
}