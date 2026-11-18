"use client";

import { useState, type FormEvent } from "react";

import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { getApiErrorMessage, isApiError } from "@/lib/api/errors";

import { changePassword } from "../api";

interface FieldErrors {
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
}

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState("");
  const [sessionsRevoked, setSessionsRevoked] = useState<number | null>(
    null,
  );
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
    setSessionsRevoked(null);

    const nextErrors: FieldErrors = {};

    if (!currentPassword) {
      nextErrors.current_password = "Kata sandi saat ini wajib diisi.";
    }

    if (!newPassword) {
      nextErrors.new_password = "Kata sandi baru wajib diisi.";
    } else if (newPassword.length < 12) {
      nextErrors.new_password = "Kata sandi baru minimal 12 karakter.";
    } else if (newPassword.length > 128) {
      nextErrors.new_password = "Kata sandi baru maksimal 128 karakter.";
    } else if (newPassword === currentPassword) {
      nextErrors.new_password =
        "Kata sandi baru harus berbeda dari kata sandi lama.";
    }

    if (!confirmPassword) {
      nextErrors.confirm_password =
        "Konfirmasi kata sandi baru wajib diisi.";
    } else if (confirmPassword !== newPassword) {
      nextErrors.confirm_password =
        "Konfirmasi tidak sama dengan kata sandi baru.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      const response = await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSessionsRevoked(response.sessions_revoked);
    } catch (err) {
      if (
        isApiError(err) &&
        (err.status === 400 ||
          /kata sandi lama|password lama/i.test(err.detail))
      ) {
        setFieldErrors({
          current_password: getApiErrorMessage(
            err,
            "Kata sandi lama salah.",
          ),
        });
      } else {
        setError(
          getApiErrorMessage(err, "Kata sandi gagal diganti."),
        );
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {sessionsRevoked !== null && (
        <div
          role="status"
          className="border border-green-200 bg-green-50 p-3 text-sm leading-6 text-green-800"
        >
          <p className="font-medium">
            Password diganti. {sessionsRevoked} sesi lain telah diakhiri.
          </p>

          <p className="mt-1 text-xs">
            Sesi di perangkat ini tetap aktif.
          </p>
        </div>
      )}

      <FormField
        label="Kata sandi saat ini"
        required
        error={fieldErrors.current_password}
      >
        <Input
          id="change-password-current"
          name="current_password"
          type="password"
          value={currentPassword}
          onChange={(event) => {
            setCurrentPassword(event.target.value);
            clearFieldError("current_password");
          }}
          autoComplete="current-password"
          required
        />
      </FormField>

      <FormField
        label="Kata sandi baru"
        hint="Minimal 12 karakter dan berbeda dari kata sandi lama."
        required
        error={fieldErrors.new_password}
      >
        <Input
          id="change-password-new"
          name="new_password"
          type="password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            clearFieldError("new_password");
          }}
          autoComplete="new-password"
          maxLength={128}
          required
        />
      </FormField>

      <FormField
        label="Ulangi kata sandi baru"
        required
        error={fieldErrors.confirm_password}
      >
        <Input
          id="change-password-confirm"
          name="confirm_password"
          type="password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            clearFieldError("confirm_password");
          }}
          autoComplete="new-password"
          maxLength={128}
          required
        />
      </FormField>

      {error && (
        <div
          role="alert"
          className="border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-800"
        >
          {error}
        </div>
      )}

      <div className="border-t border-paper-line pt-5 sm:flex sm:justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-11 w-full items-center justify-center border border-bg-dark bg-bg-dark px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-bg-dark/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {isSaving ? "Menyimpan..." : "Simpan kata sandi"}
        </button>
      </div>
    </form>
  );
}
