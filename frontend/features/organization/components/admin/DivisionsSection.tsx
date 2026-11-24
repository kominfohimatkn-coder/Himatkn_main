"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Layers, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";

import { MobileList, MobileRow, Table, Td, Th, Tr } from "@/components/admin/shared/DataTable";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { Button } from "@/components/ui/Button";

import type { AdminDivision, AdminPosition } from "../../types";

/** Tombol ↑ ↓ untuk memindah urutan divisi. */
function MoveButtons({
  division,
  index,
  total,
  busy,
  onMove,
}: {
  division: AdminDivision;
  index: number;
  total: number;
  busy: boolean;
  onMove: (division: AdminDivision, direction: -1 | 1) => void;
}) {
  return (
    <span className="inline-flex gap-0.5">
      <Button
        variant="ghost"
        size="icon"
        className="size-8!"
        disabled={busy || index === 0}
        aria-label={`Naikkan ${division.name}`}
        onClick={() => onMove(division, -1)}
      >
        <ArrowUp aria-hidden="true" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8!"
        disabled={busy || index === total - 1}
        aria-label={`Turunkan ${division.name}`}
        onClick={() => onMove(division, 1)}
      >
        <ArrowDown aria-hidden="true" />
      </Button>
    </span>
  );
}

/**
 * Daftar divisi satu periode, mengikuti tab "Divisi & jabatan" di Design/admin.
 * Angka urutan tidak ditampilkan; urutan diubah dengan tombol ↑ ↓.
 * Di ponsel, ketuk baris untuk edit; tombol "Ubah urutan" menampilkan ↑ ↓.
 */
export default function DivisionsSection({
  periodName,
  divisions,
  memberCounts,
  isLoading,
  error,
  canManage,
  moving,
  onReload,
  onCreate,
  onEdit,
  onDelete,
  onCopy,
  onMove,
}: {
  periodName: string;
  /** Sudah urut. */
  divisions: AdminDivision[];
  memberCounts: Map<number, number>;
  isLoading: boolean;
  error: string;
  canManage: boolean;
  /** Sedang menyimpan urutan. */
  moving: boolean;
  onReload: () => void;
  onCreate: () => void;
  onEdit: (division: AdminDivision) => void;
  onDelete: (division: AdminDivision) => void;
  onCopy: () => void;
  onMove: (division: AdminDivision, direction: -1 | 1) => void;
}) {
  const [reordering, setReordering] = useState(false);

  let body;
  if (isLoading) {
    body = (
      <div role="status" aria-label="Memuat divisi" className="grid gap-4 p-4">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="grid animate-pulse gap-2">
            <div className="h-3 w-2/5 rounded-[3px] bg-green-900/5" />
            <div className="h-2.5 w-1/5 rounded-[3px] bg-green-900/5" />
          </div>
        ))}
      </div>
    );
  } else if (error) {
    body = (
      <StateBlock
        tone="error"
        icon={<RefreshCw />}
        label="Gagal memuat"
        title="Divisi tidak dapat dimuat"
        action={
          <Button variant="outline" onClick={onReload}>
            <RefreshCw aria-hidden="true" /> Coba lagi
          </Button>
        }
      >
        {error}
      </StateBlock>
    );
  } else if (divisions.length === 0) {
    body = (
      <StateBlock
        icon={<Layers />}
        label={`Periode ${periodName}`}
        title="Belum ada divisi"
        action={
          canManage ? (
            <Button onClick={onCopy}>
              <Copy aria-hidden="true" /> Salin divisi
            </Button>
          ) : undefined
        }
      >
        Salin divisi dari periode sebelumnya agar tidak perlu mengetik ulang, lalu sesuaikan.
      </StateBlock>
    );
  } else {
    body = (
      <>
        <Table
          className="max-[640px]:hidden"
          head={
            <>
              <Th>Divisi</Th>
              <Th>Anggota</Th>
              <Th>
                <span className="sr-only">Aksi</span>
              </Th>
            </>
          }
        >
          {divisions.map((division, index) => (
            <Tr key={division.id}>
              <Td>
                <div className="font-semibold text-green-900">{division.name}</div>
                {division.description ? (
                  <div className="mt-0.5 line-clamp-2 max-w-[52ch] text-xs text-muted">
                    {division.description}
                  </div>
                ) : null}
              </Td>
              <Td label="Anggota">{memberCounts.get(division.id) ?? 0}</Td>
              <Td actions>
                {canManage ? (
                  <div className="inline-flex items-center gap-1">
                    <MoveButtons division={division} index={index} total={divisions.length} busy={moving} onMove={onMove} />
                    <Button variant="outline" size="sm" onClick={() => onEdit(division)}>
                      <Pencil aria-hidden="true" /> Ubah
                    </Button>
                    <Button
                      variant="danger-outline"
                      size="icon"
                      className="size-8!"
                      aria-label={`Hapus ${division.name}`}
                      onClick={() => onDelete(division)}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ) : null}
              </Td>
            </Tr>
          ))}
        </Table>
        <MobileList>
          {divisions.map((division, index) => (
            <MobileRow
              key={division.id}
              onClick={canManage && !reordering ? () => onEdit(division) : undefined}
              title={division.name}
              meta={[`${memberCounts.get(division.id) ?? 0} anggota`, division.description]
                .filter(Boolean)
                .join(" · ")}
              trailing={
                reordering ? (
                  <MoveButtons division={division} index={index} total={divisions.length} busy={moving} onMove={onMove} />
                ) : undefined
              }
            />
          ))}
        </MobileList>
      </>
    );
  }

  return (
    <section className="rounded-[4px] border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-serif text-base leading-[1.25] font-bold text-green-900">
            Divisi periode {periodName}
          </h2>
          <p className="mt-0.5 text-xs text-muted">{divisions.length} divisi</p>
        </div>
        {canManage ? (
          <div className="flex flex-wrap gap-2">
            {divisions.length > 1 ? (
              <Button
                variant="ghost"
                size="sm"
                className="min-[641px]:hidden"
                aria-pressed={reordering}
                onClick={() => setReordering((value) => !value)}
              >
                {reordering ? "Selesai" : "Ubah urutan"}
              </Button>
            ) : null}
            <Button variant="outline" size="sm" onClick={onCopy}>
              <Copy aria-hidden="true" /> Salin
              <span className="max-[640px]:hidden">dari periode lain</span>
            </Button>
            <Button size="sm" onClick={onCreate}>
              <Plus aria-hidden="true" /> Tambah
            </Button>
          </div>
        ) : null}
      </div>
      {body}
    </section>
  );
}

/** Jabatan berlaku untuk semua periode dan tidak diubah dari panel. */
export function PositionsCard({
  positions,
  error,
}: {
  positions: AdminPosition[];
  error: string;
}) {
  const sorted = [...positions].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  return (
    <section className="self-start rounded-[4px] border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="font-serif text-base leading-[1.25] font-bold text-green-900">Jabatan</h2>
        <p className="mt-0.5 text-xs text-muted">Berlaku untuk semua periode.</p>
      </div>
      {error ? (
        <p className="px-5 py-4 text-[13px] text-danger">{error}</p>
      ) : (
        <ol className="divide-y divide-line">
          {sorted.map((position, index) => (
            <li key={position.id} className="flex gap-3 px-5 py-3 text-sm text-ink">
              <span className="w-5 shrink-0 text-right text-muted-light tabular-nums">{index + 1}.</span>
              {position.name}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}