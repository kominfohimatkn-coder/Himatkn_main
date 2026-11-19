"use client";

/* eslint-disable @next/next/no-img-element */

import { useState, type ChangeEvent } from "react";

import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import { getApiErrorMessage } from "@/lib/api/errors";
import { uploadImage } from "@/lib/media/api";

import type { AdminSettingItem } from "../../types";
import {
  settingsActionClass,
  settingsDangerActionClass,
  SettingsNotice,
} from "./SettingsPrimitives";
import {
  resolveSettingImageUrl,
  settingHint,
} from "./settings-utils";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.has(file.type.toLowerCase())) {
    return "Format tidak didukung. Gunakan JPG, PNG, atau WebP.";
  }

  return null;
}

interface HeroImageFieldProps {
  item: AdminSettingItem;
  value: string;
  altText: string;
  disabled: boolean;
  error?: string;
  onChange: (value: string) => void;
}

export default function HeroImageField({
  item,
  value,
  altText,
  disabled,
  error,
  onChange,
}: HeroImageFieldProps) {
  const { can } = useAuth();
  const canManageMedia = can(PERMISSIONS.MEDIA_MANAGE);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  const previewUrl = resolveSettingImageUrl(item, value);
  const showImage = previewUrl !== null && failedUrl !== previewUrl;
  const uploadDisabled = disabled || isUploading;

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;

    input.value = "";

    if (!file || uploadDisabled) return;

    const validationError = validateImageFile(file);

    if (validationError) {
      setUploadError(validationError);
      return;
    }

    setUploadError("");
    setIsUploading(true);

    try {
      const response = await uploadImage(file);

      onChange(response.storage_key);
      setFailedUrl(null);
    } catch (err) {
      setUploadError(
        getApiErrorMessage(err, "Foto gagal diunggah. Coba lagi."),
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="min-w-0">
      <p className="text-sm font-medium text-ink">{item.label}</p>

      {settingHint(item) ? (
        <p className="mt-1 text-xs leading-5 text-ink-soft">
          {settingHint(item)}
        </p>
      ) : null}

      <div className="mt-3 grid gap-4 sm:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] sm:items-start">
        <div className="flex aspect-[4/3] items-center justify-center overflow-hidden border border-paper-line bg-bg-light-2">
          {showImage ? (
            <img
              src={previewUrl ?? undefined}
              alt={altText.trim() || "Pratinjau foto hero"}
              className="size-full object-cover"
              onError={() => setFailedUrl(previewUrl)}
            />
          ) : (
            <p className="px-4 text-center text-xs leading-5 text-ink-soft">
              {value
                ? "Pratinjau tidak tersedia."
                : "Belum ada foto hero."}
            </p>
          )}
        </div>

        <div className="min-w-0">
          {disabled ? (
            <p className="text-xs leading-5 text-ink-soft">
              Mode baca saja. Foto hanya dapat dilihat.
            </p>
          ) : canManageMedia ? (
            <>
              <div className="flex flex-wrap gap-2">
                <label
                  className={`${settingsActionClass} cursor-pointer ${
                    uploadDisabled
                      ? "cursor-not-allowed opacity-50"
                      : ""
                  }`}
                  aria-disabled={uploadDisabled || undefined}
                >
                  {isUploading
                    ? "Mengunggah..."
                    : value
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

                {value ? (
                  <button
                    type="button"
                    className={settingsDangerActionClass}
                    disabled={uploadDisabled}
                    onClick={() => {
                      setUploadError("");
                      onChange("");
                    }}
                  >
                    Hapus foto
                  </button>
                ) : null}
              </div>

              <p className="mt-2 text-xs leading-5 text-ink-soft">
                JPG, PNG, atau WebP. Foto disimpan sebagai storage key gambar
                dan baru berlaku di situs setelah disimpan.
              </p>
            </>
          ) : (
            <SettingsNotice tone="warning">
              Mengunggah gambar membutuhkan izin Unggah media. Minta
              superadmin atau admin yang memiliki izin tersebut untuk
              mengunggah foto. Field lain tetap dapat diubah.
            </SettingsNotice>
          )}

          {isUploading ? (
            <p
              role="status"
              className="mt-2 text-xs leading-5 text-ink-soft"
            >
              Mengompres dan mengunggah foto...
            </p>
          ) : null}

          {uploadError || error ? (
            <p
              role="alert"
              className="mt-2 text-xs leading-5 text-danger"
            >
              {uploadError || error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
