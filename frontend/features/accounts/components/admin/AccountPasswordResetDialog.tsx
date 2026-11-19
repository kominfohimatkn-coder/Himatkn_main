"use client";

import { useState, type FormEvent } from "react";

import FormDialog from "@/components/admin/shared/FormDialog";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage } from "@/lib/api/errors";

import { AccountsNotice } from "./AccountsPrimitives";

import type { AdminAccount } from "../../types";

interface AccountPasswordResetDialogProps {
  account: AdminAccount;
  onClose: () => void;
  onSubmit: (password: string) => Promise<void>;
}

interface FieldErrors {
  password?: string;
  confirm?: string;
}

export default function AccountPasswordResetDialog({
  account,
  onClose,
  onSubmit,
}: AccountPasswordResetDialogProps) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

    if (!password) {
      nextErrors.password = "Kata sandi baru wajib diisi.";
    } else if (password.length < 12) {
      nextErrors.password = "Kata sandi baru minimal 12 karakter.";
    } else if (password.length > 128) {
      nextErrors.password = "Kata sandi baru maksimal 128 karakter.";
    }

    if (!confirm) {
      nextErrors.confirm = "Konfirmasi kata sandi wajib diisi.";
    } else if (confirm !== password) {
      nextErrors.confirm = "Konfirmasi tidak sama dengan kata sandi baru.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setIsSaving(true);

    try {
      await onSubmit(password);
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Kata sandi akun gagal direset."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <FormDialog
      open
      eyebrow="Reset kata sandi"
      title={`Reset kata sandi ${account.username}`}
      description="Kata sandi baru akan langsung berlaku dan seluruh sesi akun ini diakhiri."
      size="md"
      busy={isSaving}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
        <FormField
          label="Kata sandi baru"
          hint="Minimal 12 karakter."
          required
          error={fieldErrors.password}
        >
          <Input
            id="reset-password"
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
          label="Konfirmasi kata sandi baru"
          required
          error={fieldErrors.confirm}
        >
          <Input
            id="reset-password-confirm"
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
            {isSaving ? "Mereset..." : "Reset kata sandi"}
          </button>
        </footer>
      </form>
    </FormDialog>
  );
}
