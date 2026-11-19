"use client";

import { Can } from "@/components/admin/shared/Can";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/features/auth/permissions";

import type { AdminSettingItem } from "../../types";
import HeroImageField from "./HeroImageField";
import SettingField from "./SettingField";
import { SettingsNotice } from "./SettingsPrimitives";
import {
  aboutItemNumber,
  isAboutItemKey,
  isWideSetting,
  type SettingsGroup,
} from "./settings-utils";

interface SettingsGroupFormProps {
  group: SettingsGroup;
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

export default function SettingsGroupForm({
  group,
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
      className="mt-4 border border-paper-line bg-paper"
    >
      <header className="border-b border-paper-line px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              id={`settings-group-${group.key}-title`}
              className="font-serif text-xl font-semibold text-bg-dark"
            >
              {group.label}
            </h2>
            <p className="mt-1 text-sm leading-6 text-ink-soft">
              {group.description}
            </p>
          </div>

          {changedCount > 0 ? (
            <span className="inline-flex border border-gold/50 bg-gold/15 px-2 py-1 text-xs font-semibold text-ink">
              {changedCount} perubahan belum disimpan
            </span>
          ) : null}
        </div>
      </header>

      <div className="space-y-5 px-4 py-5 sm:px-5">
        {error ? (
          <SettingsNotice tone="error">{error}</SettingsNotice>
        ) : null}

        {success ? (
          <SettingsNotice tone="success">
            <strong>{success}</strong>
            <span className="mt-1 block text-xs leading-5">
              Situs publik diperbarui paling lambat ±1 menit setelah
              perubahan disimpan.
            </span>
          </SettingsNotice>
        ) : null}

        {group.key === "about" ? (
          <>
            {aboutHeadItems.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {aboutHeadItems.map((item) =>
                  renderField(
                    item,
                    isWideSetting(item) ? "md:col-span-2" : undefined,
                  ),
                )}
              </div>
            ) : null}

            {aboutPointNumbers.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-3">
                {aboutPointNumbers.map((pointNumber) => {
                  const pointItems = aboutPointItems.filter(
                    (item) =>
                      aboutItemNumber(item.key) === pointNumber,
                  );

                  return (
                    <fieldset
                      key={pointNumber}
                      className="min-w-0 border border-paper-line bg-bg-light p-4"
                    >
                      <legend className="px-1 font-serif text-sm font-semibold text-bg-dark">
                        Poin {pointNumber}
                      </legend>

                      <div className="mt-2 grid gap-4">
                        {pointItems.map((item) => renderField(item))}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : (
          <>
            {imageItem ? (
              <div className="grid gap-5 border-b border-paper-line pb-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
                <HeroImageField
                  item={imageItem}
                  value={valueOf(imageItem)}
                  altText={
                    imageAltItem ? valueOf(imageAltItem) : ""
                  }
                  disabled={disabled}
                  error={errors[imageItem.key]}
                  onChange={(value) => onChange(imageItem.key, value)}
                />

                {imageAltItem
                  ? renderField(imageAltItem)
                  : null}
              </div>
            ) : null}

            {remainingItems.length > 0 ? (
              <div className="grid gap-5 md:grid-cols-2">
                {remainingItems.map((item) =>
                  renderField(
                    item,
                    isWideSetting(item) ? "md:col-span-2" : undefined,
                  ),
                )}
              </div>
            ) : null}
          </>
        )}

        <Can permission={PERMISSIONS.SETTINGS_MANAGE}>
          <div className="flex flex-col gap-3 border-t border-paper-line pt-4 sm:flex-row sm:items-center">
            <p
              role="status"
              className="text-xs leading-5 text-ink-soft"
            >
              {changedCount > 0
                ? `${changedCount} perubahan belum disimpan pada bagian ini.`
                : "Semua perubahan pada bagian ini sudah tersimpan."}
            </p>

            <div className="flex flex-wrap gap-2 sm:ml-auto">
              <Button
                variant="outline"
                onClick={onDiscard}
                disabled={changedCount === 0 || isSaving}
              >
                Batalkan
              </Button>

              <Button
                variant="dark"
                onClick={onSave}
                disabled={changedCount === 0 || isSaving}
              >
                {isSaving
                  ? "Menyimpan..."
                  : changedCount > 0
                    ? `Simpan perubahan (${changedCount})`
                    : "Simpan perubahan"}
              </Button>
            </div>
          </div>
        </Can>
      </div>
    </section>
  );
}
