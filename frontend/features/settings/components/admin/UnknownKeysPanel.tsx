"use client";

import { Check, Trash2 } from "lucide-react";

import { Can } from "@/components/admin/shared/Can";
import { Notice } from "@/components/admin/shared/Notice";
import { Button } from "@/components/ui/Button";
import { PERMISSIONS } from "@/features/auth/permissions";

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
      className="mt-5 rounded-[4px] border border-line bg-[#f7faf8]"
    >
      <header className="border-b border-line px-5 py-4">
        <h2
          id="settings-unknown-title"
          className="font-serif text-base leading-[1.25] font-bold text-green-900"
        >
          Pengaturan lama yang tidak dikenal
        </h2>
        <p className="mt-0.5 text-xs text-muted">
          Sisa data dari versi lama. Tidak dipakai situs dan aman dihapus.
        </p>
      </header>

      {message ? (
        <div className="px-5 pt-4">
          <Notice icon={<Check aria-hidden="true" />}>{message}</Notice>
        </div>
      ) : null}

      <ul className="divide-y divide-line">
        {keys.map((key) => (
          <li key={key} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
            <code className="font-mono text-xs break-all text-ink">{key}</code>

            <Can permission={PERMISSIONS.SETTINGS_MANAGE}>
              <Button
                variant="danger-outline"
                size="sm"
                aria-label={`Hapus pengaturan lama ${key}`}
                onClick={() => onDeleteRequest(key)}
              >
                <Trash2 aria-hidden="true" /> Hapus
              </Button>
            </Can>
          </li>
        ))}
      </ul>
    </section>
  );
}