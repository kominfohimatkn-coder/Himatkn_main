"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Copy, Pencil, Plus, RefreshCw, Search, Users } from "lucide-react";

import { Notice } from "@/components/admin/shared/Notice";
import { SearchInput, SelectSm } from "@/components/admin/shared/ListControls";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { Button } from "@/components/ui/Button";

import MemberAvatar from "./MemberAvatar";

import type { AdminDivision, AdminMember, AdminPosition } from "../../types";

interface MemberGroup {
  key: string;
  divisionId: number | null;
  name: string;
  members: AdminMember[];
}

/**
 * Tab Anggota di halaman Struktur, mengikuti `.division-block` + `.member` di Design/admin.
 * Anggota dikelompokkan per divisi dan diurutkan seperti di halaman publik:
 * urutan jabatan dulu, lalu urutan anggota, lalu nama.
 * Seluruh kartu anggota bisa diketuk untuk membuka form ubah.
 */
export default function MembersSection({
  divisions,
  members,
  positions,
  positionsLoading,
  positionsError,
  isLoading,
  error,
  canManage,
  onReload,
  onCreate,
  onEdit,
  onCopyDivisions,
}: {
  /** Sudah urut. */
  divisions: AdminDivision[];
  members: AdminMember[];
  positions: AdminPosition[];
  positionsLoading: boolean;
  positionsError: string;
  isLoading: boolean;
  error: string;
  canManage: boolean;
  onReload: () => void;
  onCreate: (divisionId?: number | null) => void;
  onEdit: (member: AdminMember) => void;
  onCopyDivisions: () => void;
}) {
  const [query, setQuery] = useState("");
  const [divisionFilter, setDivisionFilter] = useState("");

  const positionById = useMemo(
    () => new Map(positions.map((position) => [position.id, position])),
    [positions],
  );

  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
  const filtering = Boolean(normalizedQuery || divisionFilter);

  const groups = useMemo(() => {
    const rank = (member: AdminMember) =>
      positionById.get(member.position_id)?.sort_order ?? Number.MAX_SAFE_INTEGER;
    const sortMembers = (list: AdminMember[]) =>
      [...list].sort(
        (first, second) =>
          rank(first) - rank(second) ||
          first.sort_order - second.sort_order ||
          first.name.localeCompare(second.name, "id"),
      );

    const visible = members.filter(
      (member) =>
        (!normalizedQuery || member.name.toLocaleLowerCase("id-ID").includes(normalizedQuery)) &&
        (!divisionFilter || String(member.division_id) === divisionFilter),
    );
    const known = new Set(divisions.map((division) => division.id));

    const result: MemberGroup[] = divisions.map((division) => ({
      key: `division-${division.id}`,
      divisionId: division.id,
      name: division.name,
      members: sortMembers(visible.filter((member) => member.division_id === division.id)),
    }));

    const unassigned = visible.filter(
      (member) => member.division_id === null || !known.has(member.division_id),
    );
    if (unassigned.length > 0) {
      result.push({ key: "unassigned", divisionId: null, name: "Tanpa divisi", members: sortMembers(unassigned) });
    }

    /* Saat mencari/menyaring, divisi kosong disembunyikan. */
    return filtering ? result.filter((group) => group.members.length > 0) : result;
  }, [divisions, divisionFilter, filtering, members, normalizedQuery, positionById]);

  const positionsReady = !positionsLoading && !positionsError && positions.length > 0;
  const canAdd = canManage && positionsReady;
  const visibleCount = groups.reduce((total, group) => total + group.members.length, 0);

  if (isLoading) {
    return (
      <div role="status" aria-label="Memuat anggota" className="grid gap-3">
        {[0, 1].map((block) => (
          <div key={block} className="animate-pulse rounded-[4px] border border-line bg-white p-4">
            <div className="h-3.5 w-1/4 rounded-[3px] bg-green-900/5" />
            <div className="mt-4 grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-[62px] rounded-[4px] bg-green-900/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[4px] border border-line bg-white">
        <StateBlock
          tone="error"
          icon={<RefreshCw />}
          label="Gagal memuat"
          title="Anggota tidak dapat dimuat"
          action={
            <Button variant="outline" onClick={onReload}>
              <RefreshCw aria-hidden="true" /> Coba lagi
            </Button>
          }
        >
          {error}
        </StateBlock>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="rounded-[4px] border border-line bg-white">
        <StateBlock
          icon={<Users />}
          label="Anggota"
          title="Belum ada anggota di periode ini"
          action={
            !canManage ? undefined : divisions.length > 0 ? (
              <Button disabled={!positionsReady} onClick={() => onCreate()}>
                <Plus aria-hidden="true" /> Tambah anggota
              </Button>
            ) : (
              <Button onClick={onCopyDivisions}>
                <Copy aria-hidden="true" /> Salin divisi
              </Button>
            )
          }
        >
          {divisions.length > 0
            ? "Tambahkan pengurus mulai dari Ketua Himpunan dan Badan Pengurus Harian."
            : "Siapkan divisi dulu, lalu isi anggotanya."}
        </StateBlock>
      </div>
    );
  }

  return (
    <>
      {positionsError ? (
        <Notice tone="amber" icon={<AlertTriangle aria-hidden="true" />} className="mb-3.5">
          <strong>Daftar jabatan belum dapat dimuat.</strong> Anggota tetap tampil, tetapi
          jabatannya tidak, dan anggota belum dapat ditambah atau diubah. {positionsError}
        </Notice>
      ) : null}

      <div className="mb-3.5 flex flex-wrap items-center gap-2.5 rounded-[4px] border border-line bg-white px-4 py-3.5 max-[640px]:grid max-[640px]:grid-cols-1 max-[640px]:p-3">
        <SearchInput
          placeholder="Cari nama anggota…"
          aria-label="Cari anggota"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <SelectSm
          aria-label="Divisi"
          value={divisionFilter}
          onChange={(event) => setDivisionFilter(event.target.value)}
        >
          <option value="">Semua divisi</option>
          {divisions.map((division) => (
            <option key={division.id} value={String(division.id)}>
              {division.name}
            </option>
          ))}
        </SelectSm>
        <span aria-live="polite" className="ml-auto text-xs text-muted max-[640px]:ml-0">
          {filtering ? `${visibleCount} dari ${members.length} anggota` : `${members.length} anggota`}
        </span>
      </div>

      {groups.length === 0 ? (
        <div className="rounded-[4px] border border-line bg-white">
          <StateBlock
            icon={<Search />}
            label="Pencarian"
            title="Tidak ada anggota yang cocok"
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("");
                  setDivisionFilter("");
                }}
              >
                Tampilkan semua anggota
              </Button>
            }
          >
            Coba nama lain atau pilih Semua divisi.
          </StateBlock>
        </div>
      ) : (
        <div className="grid gap-4">
          {groups.map((group) => (
            <section
              key={group.key}
              aria-labelledby={`member-group-${group.key}`}
              className="rounded-[4px] border border-line bg-white"
            >
              <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5 max-[640px]:px-4">
                <div className="min-w-0">
                  <h2
                    id={`member-group-${group.key}`}
                    className="font-serif text-base leading-[1.25] font-bold text-green-900"
                  >
                    {group.name}
                  </h2>
                  <p className="mt-0.5 text-xs text-muted">{group.members.length} orang</p>
                </div>
                {canAdd && group.divisionId !== null ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`Tambah anggota ${group.name}`}
                    onClick={() => onCreate(group.divisionId)}
                  >
                    <Plus aria-hidden="true" /> Tambah
                  </Button>
                ) : null}
              </div>

              {group.members.length === 0 ? (
                <p className="px-5 py-5 text-[13px] text-muted max-[640px]:px-4">
                  Belum ada anggota di divisi ini.
                </p>
              ) : (
                <ul className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5 p-4 max-[640px]:grid-cols-1 max-[640px]:p-3">
                  {group.members.map((member) => {
                    const role = positionById.get(member.position_id)?.name ?? "Jabatan tidak tersedia";
                    const content = (
                      <>
                        <MemberAvatar name={member.name} photoUrl={member.photo_url} />
                        <span className="min-w-0 flex-1">
                          <span className="block font-serif text-sm leading-[1.3] font-bold wrap-anywhere text-green-900">
                            {member.name}
                          </span>
                          <span className="mt-[3px] block text-[11px] font-semibold tracking-[0.1em] text-green-700 uppercase">
                            {role}
                          </span>
                        </span>
                      </>
                    );
                    const card =
                      "flex w-full items-center gap-3 rounded-[4px] border border-line bg-white p-3 text-left";

                    return (
                      <li key={member.id}>
                        {canAdd ? (
                          <button
                            type="button"
                            onClick={() => onEdit(member)}
                            aria-label={`Ubah ${member.name}, ${role}`}
                            className={`${card} group cursor-pointer transition-[border-color,box-shadow] hover:border-line-strong hover:shadow-[0_6px_18px_rgba(6,38,27,0.05)] active:bg-[#f7faf8]`}
                          >
                            {content}
                            <Pencil
                              aria-hidden="true"
                              className="size-4 shrink-0 text-muted-light transition-colors group-hover:text-green-800"
                            />
                          </button>
                        ) : (
                          <div className={card}>{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </>
  );
}