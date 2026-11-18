"use client";

import { useMemo, useState } from "react";

import { Can } from "@/components/admin/shared/Can";
import { Input } from "@/components/ui/Input";
import { PERMISSIONS } from "@/features/auth/permissions";

import MemberAvatar from "./MemberAvatar";
import {
  organizationActionClass,
  organizationPrimaryActionClass,
  OrganizationNotice,
} from "./OrganizationPrimitives";

import type {
  AdminDivision,
  AdminMember,
  AdminPosition,
} from "../../types";

interface MembersSectionProps {
  periodName: string;
  divisions: AdminDivision[];
  members: AdminMember[];
  positions: AdminPosition[];
  positionsLoading: boolean;
  positionsError: string;
  isLoading: boolean;
  error: string;
  onReload: () => void;
  onCreate: (divisionId?: number | null) => void;
  onEdit: (member: AdminMember) => void;
}

interface MemberGroup {
  key: string;
  divisionId: number | null;
  name: string;
  members: AdminMember[];
}

function sortMembers(members: AdminMember[]): AdminMember[] {
  return [...members].sort(
    (first, second) =>
      first.sort_order - second.sort_order ||
      first.name.localeCompare(second.name, "id"),
  );
}

function matchesQuery(name: string, query: string): boolean {
  return name.toLocaleLowerCase("id-ID").includes(query);
}

export default function MembersSection({
  periodName,
  divisions,
  members,
  positions,
  positionsLoading,
  positionsError,
  isLoading,
  error,
  onReload,
  onCreate,
  onEdit,
}: MembersSectionProps) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");

  const positionNames = useMemo(
    () => new Map(positions.map((position) => [position.id, position.name])),
    [positions],
  );

  const sortedDivisions = useMemo(
    () =>
      [...divisions].sort(
        (first, second) =>
          first.sort_order - second.sort_order ||
          first.name.localeCompare(second.name, "id"),
      ),
    [divisions],
  );

  const filteredMembers = normalizedQuery
    ? members.filter((member) =>
        matchesQuery(member.name, normalizedQuery),
      )
    : members;

  const knownDivisionIds = new Set(
    sortedDivisions.map((division) => division.id),
  );

  const unassignedMembers = sortMembers(
    filteredMembers.filter(
      (member) =>
        member.division_id === null ||
        !knownDivisionIds.has(member.division_id),
    ),
  );

  const groups: MemberGroup[] = sortedDivisions.map((division) => ({
    key: `division-${division.id}`,
    divisionId: division.id,
    name: division.name,
    members: sortMembers(
      filteredMembers.filter(
        (member) => member.division_id === division.id,
      ),
    ),
  }));

  if (unassignedMembers.length > 0) {
    groups.push({
      key: "unassigned",
      divisionId: null,
      name: "Tanpa divisi",
      members: unassignedMembers,
    });
  }

  const visibleGroups = normalizedQuery
    ? groups.filter((group) => group.members.length > 0)
    : groups;

  const positionsReady =
    !positionsLoading && !positionsError && positions.length > 0;

  const addDisabledReason = positionsLoading
    ? "Daftar jabatan sedang dimuat."
    : positionsError
      ? "Daftar jabatan gagal dimuat."
      : positions.length === 0
        ? "Belum ada jabatan yang tersedia."
        : undefined;

  return (
    <section aria-labelledby="member-list-title" className="mt-6">
      <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2
            id="member-list-title"
            className="font-serif text-lg font-semibold text-bg-dark"
          >
            Anggota periode {periodName}
          </h2>

          <p
            aria-live="polite"
            className="mt-1 text-xs leading-5 text-ink-soft"
          >
            {isLoading
              ? "Memuat anggota..."
              : normalizedQuery
                ? `${filteredMembers.length} dari ${members.length} anggota cocok dengan pencarian`
                : `${members.length} anggota, dikelompokkan per divisi`}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:flex">
          <button
            type="button"
            onClick={onReload}
            disabled={isLoading}
            className={organizationActionClass}
          >
            Muat ulang
          </button>

          <Can permission={PERMISSIONS.ORGANIZATION_MANAGE}>
            <button
              type="button"
              onClick={() => onCreate()}
              disabled={isLoading || !positionsReady}
              title={addDisabledReason}
              className={organizationPrimaryActionClass}
            >
              Tambah anggota
            </button>
          </Can>
        </div>
      </div>

      {positionsError && (
        <div className="mb-4">
          <OrganizationNotice tone="error">
            <p className="font-medium">Daftar jabatan belum dapat dimuat</p>
            <p className="mt-1">{positionsError}</p>
            <p className="mt-1">
              Anggota tetap dapat dilihat, tetapi jabatan tidak dapat
              ditampilkan dan anggota baru belum dapat disimpan.
            </p>
          </OrganizationNotice>
        </div>
      )}

      <div
        aria-busy={isLoading}
        className="border border-paper-line bg-bg-light"
      >
        {isLoading ? (
          <div className="space-y-4 p-6" role="status">
            <p className="text-sm text-ink-soft">Memuat daftar anggota...</p>

            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-14 animate-pulse bg-bg-light-2 motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="px-5 py-8">
            <h3 className="text-sm font-semibold">
              Anggota belum dapat dimuat
            </h3>

            <p className="mt-2 text-sm leading-6 text-red-700">{error}</p>

            <button
              type="button"
              onClick={onReload}
              className={`${organizationActionClass} mt-4`}
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-paper-line p-4">
              <label
                htmlFor="member-search"
                className="block text-sm font-medium text-ink"
              >
                Cari anggota
              </label>

              <Input
                id="member-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari nama anggota…"
                className="mt-1.5"
              />
            </div>

            {members.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <h3 className="font-serif text-lg font-semibold text-bg-dark">
                  Belum ada anggota di periode ini
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-ink-soft">
                  {sortedDivisions.length > 0
                    ? "Tambahkan pengurus mulai dari Ketua Himpunan dan Badan Pengurus Harian."
                    : "Siapkan divisi dulu, lalu isi anggotanya. Anggota juga dapat ditambahkan tanpa divisi."}
                </p>

                <Can permission={PERMISSIONS.ORGANIZATION_MANAGE}>
                  <button
                    type="button"
                    onClick={() => onCreate()}
                    disabled={!positionsReady}
                    title={addDisabledReason}
                    className={`${organizationPrimaryActionClass} mt-5`}
                  >
                    Tambah anggota
                  </button>
                </Can>
              </div>
            ) : normalizedQuery && visibleGroups.length === 0 ? (
              <div className="px-5 py-12 text-center">
                <h3 className="font-serif text-lg font-semibold text-bg-dark">
                  Tidak ada anggota yang cocok
                </h3>

                <p className="mt-2 text-sm leading-6 text-ink-soft">
                  Tidak ada nama yang memuat “{query.trim()}”.
                </p>

                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className={`${organizationActionClass} mt-5`}
                >
                  Tampilkan semua anggota
                </button>
              </div>
            ) : (
              <div className="space-y-3 p-3 sm:p-4">
                {visibleGroups.map((group) => (
                  <section
                    key={group.key}
                    aria-labelledby={`member-group-${group.key}`}
                    className="border border-paper-line bg-bg-light"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-paper-line bg-bg-light-2/60 px-4 py-3">
                      <div className="min-w-0">
                        <h3
                          id={`member-group-${group.key}`}
                          className="text-sm font-semibold text-bg-dark"
                        >
                          {group.name}
                        </h3>

                        <p className="mt-0.5 text-xs text-ink-soft">
                          {group.members.length} orang
                        </p>
                      </div>

                      <Can permission={PERMISSIONS.ORGANIZATION_MANAGE}>
                        {group.divisionId !== null && (
                          <button
                            type="button"
                            onClick={() => onCreate(group.divisionId ?? null)}
                            disabled={!positionsReady}
                            title={addDisabledReason}
                            className={organizationActionClass}
                          >
                            Tambah anggota
                          </button>
                        )}
                      </Can>
                    </div>

                    {group.members.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-ink-soft">
                        Belum ada anggota di divisi ini.
                      </p>
                    ) : (
                      <div className="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-3">
                        {group.members.map((member) => (
                          <article
                            key={member.id}
                            className="flex items-start gap-3 border border-paper-line bg-bg-light p-3"
                          >
                            <MemberAvatar
                              name={member.name}
                              photoUrl={member.photo_url}
                            />

                            <div className="min-w-0 flex-1">
                              <p className="font-medium break-words text-bg-dark">
                                {member.name}
                              </p>

                              <p className="mt-0.5 text-xs leading-5 text-ink-soft">
                                {positionNames.get(member.position_id) ??
                                  "Jabatan tidak tersedia"}
                              </p>
                            </div>

                            <Can
                              permission={PERMISSIONS.ORGANIZATION_MANAGE}
                            >
                              <button
                                type="button"
                                onClick={() => onEdit(member)}
                                aria-label={`Ubah ${member.name}`}
                                className={organizationActionClass}
                              >
                                Ubah
                              </button>
                            </Can>
                          </article>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
