"use client";

import { useState, type ChangeEvent } from "react";
import { AlertTriangle, Trash2, Upload } from "lucide-react";

import { Notice } from "@/components/admin/shared/Notice";
import { Button, buttonClassName } from "@/components/ui/Button";

import { PERMISSIONS } from "@/features/auth/permissions";
import { useAuth } from "@/features/auth/AuthContext";
import { uploadImage } from "@/lib/media/api";

import { getApiErrorMessage } from "@/lib/api/errors";

import MemberAvatar from "./MemberAvatar";

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
        getApiErrorMessage(
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
    <div className="flex items-center gap-4 max-[640px]:flex-col max-[640px]:items-start">
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
                className={buttonClassName({
                  variant: "outline",
                  size: "sm",
                  className: uploadDisabled ? "pointer-events-none opacity-45" : "",
                })}
                aria-disabled={uploadDisabled || undefined}
              >
                <Upload aria-hidden="true" />
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
                <Button variant="ghost" size="sm" onClick={handleRemove} disabled={uploadDisabled}>
                  <Trash2 aria-hidden="true" /> Hapus foto
                </Button>
              )}
            </div>

            <p className="mt-1.5 text-xs leading-5 text-muted">
              JPG, PNG, atau WebP · maks 4 MB · rasio 1:1 disarankan
            </p>
          </>
        ) : (
          <Notice tone="amber" icon={<AlertTriangle aria-hidden="true" />}>
            Mengunggah gambar membutuhkan izin Unggah media. Minta superadmin
            mengunggahkan fotonya.
          </Notice>
        )}

        {isUploading && (
          <p role="status" className="mt-2 text-xs leading-5 text-muted">
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