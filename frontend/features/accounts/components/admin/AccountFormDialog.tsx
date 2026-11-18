"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/api/errors";

import {
  getInitialManualPermissions,
  getPayloadPermissions,
} from "../../permissions";

import { AccountsNotice } from "./AccountsPrimitives";
import PermissionChecklist from "./PermissionChecklist";

import type {
  AdminAccount,
  PermissionCatalogResponse,
} from "../../types";

export interface AccountFormValues {
  username: string;
  password?: string;
  is_active: boolean;
  is_superadmin: boolean;
  permissions: string[];
}

interface AccountFormDialogProps {
  account?: AdminAccount;
  catalog: PermissionCatalogResponse;
  isSelf: boolean;
  onClose: () => void;
  onSubmit: (values: AccountFormValues) => Promise<void>;
}

interface FieldErrors {
  username?: string;
  password?: string;
  confirm?: string;
}

export default function AccountFormDialog({
  account,
  catalog,
  isSelf,
  onClose,
  onSubmit,
}: AccountFormDialogProps) {
  const [username, setUsername] = useState(account?.username ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isActive, setIsActive] = useState(account?.is_active ?? true);
  const [isSuperadmin, setIsSuperadmin] = useState(
    account?.is_superadmin ?? false,
  );
  const [manualPermissions, setManualPermissions] = useState<string[]>(
    () => getInitialManualPermissions(account, catalog),
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
      if (!current[field]) {
        return current;
      }

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

    if (!trimmedUsername) {
      nextErrors.username = "Username wajib diisi.";
    } else if (
      trimmedUsername.length < 3 ||
      trimmedUsername.length > 50
    ) {
      nextErrors.username = "Username harus 3–50 karakter.";
    }

    if (!account) {
      if (!password) {
        nextErrors.password = "Kata sandi wajib diisi.";
      } else if (password.length < 12) {
        nextErrors.password = "Kata sandi minimal 12 karakter.";
      } else if (password.length > 128) {
        nextErrors.password = "Kata sandi maksimal 128 karakter.";
      }

      if (!confirm) {
        nextErrors.confirm = "Konfirmasi kata sandi wajib diisi.";
      } else if (confirm !== password) {
        nextErrors.confirm = "Konfirmasi tidak sama dengan kata sandi.";
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
        password: account ? undefined : password,
        is_active: isActive,
        is_superadmin: isSuperadmin,
        permissions: isSuperadmin ? [] : permissionsForSubmit,
      });

      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          account ? "Akun gagal disimpan." : "Akun gagal dibuat.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow="Administrator"
      title={
        account
          ? `Ubah akun ${account.username}`
          : "Tambah akun administrator"
      }
      description={
        account
          ? "Perbarui username, status, dan izin akun."
          : "Buat akun yang dapat masuk ke panel admin."
      }
      size="xl"
      busy={isSaving}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
        <FormField
          label="Username"
          hint="3–50 karakter. Harus unik."
          required
          error={fieldErrors.username}
        >
          <Input
            id="account-username"
            name="username"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
              clearFieldError("username");
            }}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={50}
            required
            placeholder="contoh: pengurus.minfo"
          />
        </FormField>

        {isSelf && (
          <AccountsNotice tone="info">
            <strong>Ubah akun Anda sendiri lewat menu Akun saya.</strong>{" "}
            Status aktif, status superadmin, izin, dan reset password tidak
            dapat diubah dari halaman ini.{" "}
            <Link
              href="/admin/account"
              className="font-medium underline underline-offset-2"
            >
              Buka Akun saya
            </Link>
            .
          </AccountsNotice>
        )}

        {!account && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Kata sandi"
              hint="Minimal 12 karakter."
              required
              error={fieldErrors.password}
            >
              <Input
                id="account-password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  clearFieldError("password");
                }}
                autoComplete="new-password"
                maxLength={128}
                required
              />
            </FormField>

            <FormField
              label="Konfirmasi kata sandi"
              required
              error={fieldErrors.confirm}
            >
              <Input
                id="account-password-confirm"
                name="password_confirm"
                type="password"
                value={confirm}
                onChange={(event) => {
                  setConfirm(event.target.value);
                  clearFieldError("confirm");
                }}
                autoComplete="new-password"
                maxLength={128}
                required
              />
            </FormField>
          </div>
        )}

        {!isSelf && (
          <>
            {account && (
              <Checkbox
                name="is_active"
                checked={isActive}
                disabled={isSaving}
                onChange={(event) => setIsActive(event.target.checked)}
                label="Akun aktif"
                description="Akun nonaktif tidak dapat login dan semua sesinya diakhiri."
              />
            )}

            <Checkbox
              name="is_superadmin"
              checked={isSuperadmin}
              disabled={isSaving}
              onChange={(event) => setIsSuperadmin(event.target.checked)}
              label="Jadikan superadmin"
              description="Akun ini akan memiliki seluruh izin yang tersedia."
            />

            {isSuperadmin ? (
              <AccountsNotice tone="info">
                Superadmin memiliki semua izin, termasuk mengelola akun.
                Maksimal 2 akun.
              </AccountsNotice>
            ) : (
              <PermissionChecklist
                catalog={catalog}
                selected={manualPermissions}
                disabled={isSaving}
                onChange={setManualPermissions}
              />
            )}
          </>
        )}

        {error && <AccountsNotice tone="error">{error}</AccountsNotice>}

        <footer className="flex flex-col-reverse gap-2 border-t border-paper-line pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="min-h-11 border border-paper-line px-4 py-2 text-sm font-medium hover:bg-bg-light-2 disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="min-h-11 border border-bg-dark bg-bg-dark px-4 py-2 text-sm font-medium text-white hover:bg-bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Menyimpan..."
              : account
                ? "Simpan perubahan"
                : "Tambah akun"}
          </button>
        </footer>
      </form>
    </FormDialog>
  );
}
