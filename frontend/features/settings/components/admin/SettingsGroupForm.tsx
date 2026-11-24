"use client";

import { AlertTriangle, Check, ExternalLink } from "lucide-react";

import { Badge } from "@/components/admin/shared/Badge";
import { Can } from "@/components/admin/shared/Can";
import { Notice } from "@/components/admin/shared/Notice";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/features/auth/permissions";

import type { AdminSettingItem } from "../../types";
import HeroImageField from "./HeroImageField";
import SettingField from "./SettingField";
import {
  aboutItemNumber,
  isAboutItemKey,
  isWideSetting,
  type SettingsGroup,
} from "./settings-utils";

interface SettingsGroupFormProps {
  group: SettingsGroup;
  /** Halaman situs publik tempat bagian ini tampil. */
  siteHref?: string;
  values: Record<string, string>;
  disabled: boolean;
  errors: Record<string, string>;
  error: string;
  success: string;
  isSaving: boolean;
  onChange: (key: string, value: string) => void;
  onSave: () => void;
  onDiscard: () => void;
  onResetRequest: (item: AdminSettingItem) => void;
}

/**
 * Satu bagian pengaturan, mengikuti kartu bagian di `viewSettings()` Design/admin.
 * Bar simpan menempel di bawah layar selama kartu terlihat (berguna untuk bagian panjang).
 */
export default function SettingsGroupForm({
  group,
  siteHref,
  values,
  disabled,
  errors,
  error,
  success,
  isSaving,
  onChange,
  onSave,
  onDiscard,
  onResetRequest,
}: SettingsGroupFormProps) {
  const valueOf = (item: AdminSettingItem) =>
    values[item.key] ?? item.value;

  const changedItems = group.items.filter(
    (item) => valueOf(item) !== item.value,
  );

  const changedCount = changedItems.length;

  function renderField(item: AdminSettingItem, className?: string) {
    return (
      <SettingField
        key={item.key}
        item={item}
        value={valueOf(item)}
        disabled={disabled}
        error={errors[item.key]}
        showReset={item.value !== item.default && item.type !== "image"}
        className={className}
        onChange={(value) => onChange(item.key, value)}
        onResetRequest={() => onResetRequest(item)}
      />
    );
  }

  const imageItem = group.items.find((item) => item.type === "image");
  const imageAltItem = group.items.find(
    (item) => item.key === "hero_image_alt",
  );
  const remainingItems = group.items.filter(
    (item) =>
      item.key !== imageItem?.key && item.key !== imageAltItem?.key,
  );

  const aboutHeadItems = remainingItems.filter(
    (item) => !isAboutItemKey(item.key),
  );
  const aboutPointItems = remainingItems.filter((item) =>
    isAboutItemKey(item.key),
  );
  const aboutPointNumbers = Array.from(
    new Set(aboutPointItems.map((item) => aboutItemNumber(item.key))),
  )
    .filter((number) => number > 0)
    .sort((first, second) => first - second);

  return (
    <section
      id={`settings-group-${group.key}`}
      aria-labelledby={`settings-group-${group.key}-title`}
      className="rounded-[4px] border border-line bg-white"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <h2
            id={`settings-group-${group.key}-title`}
            className="font-serif text-base leading-[1.25] font-bold text-green-900"
          >
            {group.label}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{group.description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {changedCount > 0 ? <Badge tone="amber">{changedCount} belum disimpan</Badge> : null}
          {siteHref ? (
            <a
              href={siteHref}
              target="_blank"
              rel="noopener"
              className="inline-flex h-8 items-center gap-1.5 rounded-[4px] px-2.5 text-[11px] font-semibold tracking-[0.08em] text-green-800 uppercase transition-colors hover:bg-mint-50 [&_svg]:size-[14px]"
            >
              <ExternalLink aria-hidden="true" /> Lihat di situs
            </a>
          ) : null}
        </div>
      </header>

      <div className="grid gap-5 px-5 py-5 max-[640px]:px-4">
        {error ? (
          <Notice tone="amber" icon={<AlertTriangle aria-hidden="true" />}>
            <span role="alert">{error}</span>
          </Notice>
        ) : null}

        {success ? (
          <Notice icon={<Check aria-hidden="true" />}>
            <strong>{success}</strong> Situs publik diperbarui paling lambat ±1 menit.
          </Notice>
        ) : null}

        {group.key === "about" ? (
          <>
            {aboutHeadItems.length > 0 ? (
              <div className="grid gap-5 min-[641px]:grid-cols-2">
                {aboutHeadItems.map((item) =>
                  renderField(item, isWideSetting(item) ? "min-[641px]:col-span-2" : undefined),
                )}
              </div>
            ) : null}

            {aboutPointNumbers.length > 0 ? (
              <div className="grid gap-4 min-[1101px]:grid-cols-3">
                {aboutPointNumbers.map((pointNumber) => {
                  const pointItems = aboutPointItems.filter(
                    (item) => aboutItemNumber(item.key) === pointNumber,
                  );

                  return (
                    <fieldset
                      key={pointNumber}
                      className="min-w-0 rounded-[4px] border border-line bg-[#f7faf8] px-4 pt-1 pb-4"
                    >
                      <legend className="px-1 font-serif text-sm font-bold text-green-900">
                        Poin {pointNumber}
                      </legend>
                      <div className="mt-2 grid gap-4">{pointItems.map((item) => renderField(item))}</div>
                    </fieldset>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : (
          <>
            {imageItem ? (
              <div className="grid gap-5 border-b border-line pb-5 min-[1101px]:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] min-[1101px]:items-start">
                <HeroImageField
                  item={imageItem}
                  value={valueOf(imageItem)}
                  altText={imageAltItem ? valueOf(imageAltItem) : ""}
                  disabled={disabled}
                  error={errors[imageItem.key]}
                  onChange={(value) => onChange(imageItem.key, value)}
                />
                {imageAltItem ? renderField(imageAltItem) : null}
              </div>
            ) : null}

            {remainingItems.length > 0 ? (
              <div className="grid gap-5 min-[641px]:grid-cols-2">
                {remainingItems.map((item) =>
                  renderField(item, isWideSetting(item) ? "min-[641px]:col-span-2" : undefined),
                )}
              </div>
            ) : null}
          </>
        )}
      </div>

      <Can permission={PERMISSIONS.SETTINGS_MANAGE}>
        {/* Menempel di bawah layar hanya saat ada perubahan, supaya tombol Simpan selalu terjangkau. */}
        <footer
          className={`flex flex-wrap items-center gap-3 rounded-b-[4px] border-t border-line bg-white/95 px-5 py-3 max-[640px]:px-4 ${
            changedCount > 0 ? "sticky bottom-0 z-10 shadow-[0_-8px_24px_rgba(6,38,27,0.06)] backdrop-blur" : ""
          }`}
        >
          <p
            role="status"
            className={`flex min-w-0 flex-1 items-center gap-2 text-xs ${
              changedCount > 0 ? "font-semibold text-amber" : "text-muted"
            }`}
          >
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-full ${changedCount > 0 ? "bg-amber" : "bg-green-700"}`}
            />
            {changedCount > 0
              ? `${changedCount} perubahan belum disimpan`
              : "Semua perubahan tersimpan"}
          </p>

          <div className="flex gap-2 max-[640px]:w-full max-[640px]:[&>button]:flex-1">
            <Button variant="outline" onClick={onDiscard} disabled={changedCount === 0 || isSaving}>
              Batalkan
            </Button>
            <Button onClick={onSave} disabled={changedCount === 0 || isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan perubahan"}
            </Button>
          </div>
        </footer>
      </Can>
    </section>
  );
}