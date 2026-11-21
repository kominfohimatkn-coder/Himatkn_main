"use client";

import { Can } from "@/components/admin/shared/Can";
import { PERMISSIONS } from "@/features/auth/permissions";

import { SettingsNotice } from "./SettingsPrimitives";

interface UnknownKeysPanelProps {
  keys: string[];
  message: string;
  onDeleteRequest: (key: string) => void;
}

export default function UnknownKeysPanel({
  keys,
  message,
  onDeleteRequest,
}: UnknownKeysPanelProps) {
  if (keys.length === 0) return null;

  return (
    <section
      aria-labelledby="settings-unknown-title"
      className="mt-4 border border-paper-line bg-bg-light-2"
    >
      <header className="border-b border-paper-line px-4 py-4 sm:px-5">
        <h2
          id="settings-unknown-title"
          className="font-serif text-lg font-semibold text-bg-dark"
        >
          Pengaturan lama yang tidak dikenal
        </h2>
        <p className="mt-1 text-sm leading-6 text-ink-soft">
          Sisa data dari versi lama. Tidak dipakai situs dan aman dihapus.
        </p>
      </header>

      <div className="px-4 py-4 sm:px-5">
        {message ? (
          <div className="mb-3">
            <SettingsNotice tone="success">{message}</SettingsNotice>
          </div>
        ) : null}

        <ul className="divide-y divide-paper-line border border-paper-line bg-paper">
          {keys.map((key) => (
            <li
              key={key}
              className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <code className="break-all font-mono text-xs text-ink">
                {key}
              </code>

              <Can permission={PERMISSIONS.SETTINGS_MANAGE}>
                <button
                  type="button"
                  className="inline-flex min-h-9 items-center justify-center border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  aria-label={`Hapus pengaturan lama ${key}`}
                  onClick={() => onDeleteRequest(key)}
                >
                  Hapus
                </button>
              </Can>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
