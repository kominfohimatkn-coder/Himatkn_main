"use client";

import { Badge } from "@/components/admin/shared/Badge";
import { Can } from "@/components/admin/shared/Can";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { PERMISSIONS } from "@/features/auth/permissions";

import type { AdminSettingItem } from "../../types";
import { formatSettingDate } from "./SettingsPrimitives";
import { settingHint } from "./settings-utils";

interface SettingFieldProps {
  item: AdminSettingItem;
  value: string;
  disabled: boolean;
  error?: string;
  showReset: boolean;
  className?: string;
  onChange: (value: string) => void;
  onResetRequest: () => void;
}

export default function SettingField({
  item,
  value,
  disabled,
  error,
  showReset,
  className,
  onChange,
  onResetRequest,
}: SettingFieldProps) {
  const isDefault = value === item.default;
  const isLong = item.type === "multiline" || item.max_length >= 1000;

  const metaText = item.updated_at
    ? `Diubah ${formatSettingDate(item.updated_at)}`
    : isDefault
      ? item.default
        ? "Memakai nilai bawaan"
        : "Belum diisi — tidak tampil di situs"
      : "Nilai khusus";

  const control =
    item.type === "multiline" ? (
      <Textarea
        name={item.key}
        value={value}
        rows={4}
        disabled={disabled}
        invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
    ) : (
      <Input
        name={item.key}
        type={
          item.type === "email"
            ? "email"
            : item.type === "url"
              ? "url"
              : "text"
        }
        inputMode={item.type === "url" ? "url" : undefined}
        placeholder={item.type === "url" ? "https://" : undefined}
        autoComplete="off"
        value={value}
        disabled={disabled}
        invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      />
    );

  return (
    <div className={className}>
      <FormField
        label={
          <>
            <span>{item.label}</span>
            {isDefault && item.default ? (
              <span className="ml-2 align-[1px]">
                <Badge tone="outline">Bawaan</Badge>
              </span>
            ) : null}
          </>
        }
        hint={settingHint(item)}
        error={error}
      >
        {control}
      </FormField>

      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
        <span className="min-w-0 flex-1">{metaText}</span>

        {isLong && (
          <span
            className={
              value.length > item.max_length
                ? "font-semibold text-danger"
                : "tabular-nums"
            }
          >
            {value.length}/{item.max_length}
          </span>
        )}

        <Can permission={PERMISSIONS.SETTINGS_MANAGE}>
          {showReset ? (
            <button
              type="button"
              className="cursor-pointer text-xs font-medium text-green-800 underline-offset-4 hover:text-danger hover:underline disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onResetRequest}
            >
              {item.default ? "Kembalikan ke bawaan" : "Kosongkan"}
            </button>
          ) : null}
        </Can>
      </div>
    </div>
  );
}