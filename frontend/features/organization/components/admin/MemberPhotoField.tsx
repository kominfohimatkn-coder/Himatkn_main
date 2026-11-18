"use client";

import { useState, type ChangeEvent } from "react";

import { PERMISSIONS } from "@/features/auth/permissions";
import { useAuth } from "@/features/auth/AuthContext";
import { uploadImage } from "@/lib/media/api";

import { getOrganizationErrorMessage } from "../../errors";

import MemberAvatar from "./MemberAvatar";
import {
  organizationActionClass,
  organizationDangerActionClass,
  OrganizationNotice,
} from "./OrganizationPrimitives";

const ALLOWED_PHOTO_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function validatePhotoFile(file: File): string | null {
  if (!ALLOWED_PHOTO_TYPES.has(file.type.toLowerCase())) {
    return "Format tidak didukung. Gunakan JPG, PNG, atau WebP.";
  }

  return null;
}

interface MemberPhotoFieldProps {
  name: string;
  photoUrl: string | null;
  disabled?: boolean;
  onPhotoChange: (photoUrl: string | null) => void;
  onUploadingChange: (isUploading: boolean) => void;
}

export default function MemberPhotoField({
  name,
  photoUrl,
  disabled = false,
  onPhotoChange,
  onUploadingChange,
}: MemberPhotoFieldProps) {
  const { can } = useAuth();
  const canManageMedia = can(PERMISSIONS.MEDIA_MANAGE);

  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadDisabled = disabled || isUploading;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;

    input.value = "";

    if (!file || uploadDisabled) return;

    const validationError = validatePhotoFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setIsUploading(true);
    onUploadingChange(true);

    try {
      const response = await uploadImage(file);

      onPhotoChange(response.storage_key);
    } catch (err) {
      setError(
        getOrganizationErrorMessage(
          err,
          "Foto gagal diunggah. Coba lagi.",
        ),
      );
    } finally {
      setIsUploading(false);
      onUploadingChange(false);
    }
  }

  function handleRemove() {
    setError("");
    onPhotoChange(null);
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <MemberAvatar
        name={name}
        photoUrl={photoUrl}
        size="xl"
        alt="Pratinjau foto"
      />

      <div className="min-w-0 flex-1">
        {canManageMedia ? (
          <>
            <div className="flex flex-wrap gap-2">
              <label
                className={`${organizationActionClass} cursor-pointer ${
                  uploadDisabled ? "cursor-not-allowed opacity-50" : ""
                }`}
                aria-disabled={uploadDisabled || undefined}
              >
                {isUploading
                  ? "Mengunggah..."
                  : photoUrl
                    ? "Ganti foto"
                    : "Unggah foto"}

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={uploadDisabled}
                  onChange={(event) => {
                    void handleFileChange(event);
                  }}
                />
              </label>

              {photoUrl && (
                <button
                  type="button"
                  onClick={handleRemove}
                  disabled={uploadDisabled}
                  className={organizationDangerActionClass}
                >
                  Hapus foto
                </button>
              )}
            </div>

            <p className="mt-2 text-xs leading-5 text-ink-soft">
              JPG, PNG, atau WebP · maks 4 MB · rasio 1:1 disarankan
            </p>
          </>
        ) : (
          <OrganizationNotice tone="warning">
            Mengunggah gambar membutuhkan izin Unggah media. Minta superadmin
            atau admin mengunggahkan gambarnya.
          </OrganizationNotice>
        )}

        {isUploading && (
          <p role="status" className="mt-2 text-xs leading-5 text-ink-soft">
            Mengompres dan mengunggah foto...
          </p>
        )}

        {error && (
          <p role="alert" className="mt-2 text-xs leading-5 text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
