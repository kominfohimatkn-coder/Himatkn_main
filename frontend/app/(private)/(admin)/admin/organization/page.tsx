"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CalendarPlus, Eye, Plus, RefreshCw } from "lucide-react";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { Notice } from "@/components/admin/shared/Notice";
import { PageHead } from "@/components/admin/shared/PageHead";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { Tabs } from "@/components/admin/shared/Tabs";
import { useToast } from "@/components/admin/shared/Toast";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import {
  activateAdminPeriod,
  copyAdminDivisions,
  createAdminDivision,
  createAdminMember,
  createAdminPeriod,
  deleteAdminDivision,
  deleteAdminMember,
  deleteAdminPeriod,
  getAdminDivisions,
  getAdminMembers,
  getAdminPeriods,
  getAdminPositions,
  updateAdminDivision,
  updateAdminMember,
  updateAdminPeriod,
} from "@/features/organization/admin-api";
import { getApiErrorMessage } from "@/lib/api/errors";

import DivisionCopyDialog from "@/features/organization/components/admin/DivisionCopyDialog";
import DivisionFormDialog from "@/features/organization/components/admin/DivisionFormDialog";
import DivisionsSection, { PositionsCard } from "@/features/organization/components/admin/DivisionsSection";
import MemberDeleteDialog from "@/features/organization/components/admin/MemberDeleteDialog";
import MemberFormDialog from "@/features/organization/components/admin/MemberFormDialog";
import MembersSection from "@/features/organization/components/admin/MembersSection";
import PeriodChecklist from "@/features/organization/components/admin/PeriodChecklist";
import PeriodFormDialog from "@/features/organization/components/admin/PeriodFormDialog";
import PeriodStrip from "@/features/organization/components/admin/PeriodStrip";

import type { DivisionFormValues } from "@/features/organization/components/admin/DivisionFormDialog";
import type { MemberFormValues } from "@/features/organization/components/admin/MemberFormDialog";
import type { PeriodFormValues } from "@/features/organization/components/admin/PeriodFormDialog";
import type {
  AdminDivision,
  AdminMember,
  AdminPeriod,
  AdminPosition,
  DivisionCopyResponse,
} from "@/features/organization/types";

function sortDivisions(items: AdminDivision[]): AdminDivision[] {
  return [...items].sort(
    (first, second) =>
      first.sort_order - second.sort_order ||
      first.name.localeCompare(second.name, "id"),
  );
}

/** Urutan berikutnya: urutan terbesar + 10, supaya item baru masuk paling bawah. */
function nextSortOrder(items: { sort_order: number }[]): number {
  return items.reduce((max, item) => Math.max(max, item.sort_order), 0) + 10;
}

type Tab = "members" | "ref";

/** Halaman Struktur Organisasi, mengikuti `viewOrganization()` di Design/admin. */
export default function OrganizationPage() {
  const { admin, can } = useAuth();
  const toast = useToast();

  const canView = can(PERMISSIONS.ORGANIZATION_VIEW);
  const canManage = can(PERMISSIONS.ORGANIZATION_MANAGE);

  const [tab, setTab] = useState<Tab>("members");

  const [periods, setPeriods] = useState<AdminPeriod[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodsError, setPeriodsError] = useState("");
  const [periodsRefreshKey, setPeriodsRefreshKey] = useState(0);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);

  const [divisions, setDivisions] = useState<AdminDivision[]>([]);
  const [divisionsError, setDivisionsError] = useState("");
  const [divisionsRefreshKey, setDivisionsRefreshKey] = useState(0);
  const [divisionsLoadedPeriodId, setDivisionsLoadedPeriodId] = useState<number | null>(null);
  const [divisionsRefreshing, setDivisionsRefreshing] = useState(false);
  const [moving, setMoving] = useState(false);

  const [positions, setPositions] = useState<AdminPosition[]>([]);
  const [positionsLoading, setPositionsLoading] = useState(true);
  const [positionsError, setPositionsError] = useState("");

  const [members, setMembers] = useState<AdminMember[]>([]);
  const [membersError, setMembersError] = useState("");
  const [membersRefreshKey, setMembersRefreshKey] = useState(0);
  const [membersLoadedPeriodId, setMembersLoadedPeriodId] = useState<number | null>(null);
  const [membersRefreshing, setMembersRefreshing] = useState(false);

  const [periodFormTarget, setPeriodFormTarget] = useState<{ period?: AdminPeriod } | null>(null);
  const [activateTarget, setActivateTarget] = useState<AdminPeriod | null>(null);
  const [deletePeriodTarget, setDeletePeriodTarget] = useState<AdminPeriod | null>(null);
  const [divisionFormTarget, setDivisionFormTarget] = useState<{ division?: AdminDivision } | null>(null);
  const [deleteDivisionTarget, setDeleteDivisionTarget] = useState<AdminDivision | null>(null);
  const [memberFormTarget, setMemberFormTarget] = useState<{
    member?: AdminMember;
    divisionId?: number | null;
  } | null>(null);
  const [deleteMemberTarget, setDeleteMemberTarget] = useState<AdminMember | null>(null);
  const [isCopyOpen, setIsCopyOpen] = useState(false);

  /** Status dialog konfirmasi (aktifkan / hapus periode / hapus divisi). */
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    if (!canView) return;

    const controller = new AbortController();

    void getAdminPeriods({
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;

        setPeriods(result.items);
        setPeriodsError("");
        setSelectedPeriodId((current) => {
          if (
            current !== null &&
            result.items.some((period) => period.id === current)
          ) {
            return current;
          }

          return (
            result.items.find((period) => period.is_active)?.id ??
            result.items[0]?.id ??
            null
          );
        });
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        setPeriodsError(
          getApiErrorMessage(
            err,
            "Daftar periode gagal dimuat.",
          ),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setPeriodsLoading(false);
        }
      });

    return () => controller.abort();
  }, [canView, periodsRefreshKey]);

  useEffect(() => {
    if (!canView || selectedPeriodId === null) return;

    const controller = new AbortController();

    void getAdminDivisions(selectedPeriodId, {
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;

        setDivisions(sortDivisions(result.items));
        setDivisionsError("");
        setDivisionsLoadedPeriodId(selectedPeriodId);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        setDivisions([]);
        setDivisionsError(
          getApiErrorMessage(
            err,
            "Daftar divisi gagal dimuat.",
          ),
        );
        setDivisionsLoadedPeriodId(selectedPeriodId);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setDivisionsRefreshing(false);
        }
      });

    return () => controller.abort();
  }, [canView, selectedPeriodId, divisionsRefreshKey]);

  useEffect(() => {
    if (!canView) return;

    const controller = new AbortController();

    void getAdminPositions({
      signal: controller.signal,
    })
      .then((result) => {
        if (controller.signal.aborted) return;

        setPositions(result.items);
        setPositionsError("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        setPositions([]);
        setPositionsError(
          getApiErrorMessage(
            err,
            "Daftar jabatan gagal dimuat.",
          ),
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setPositionsLoading(false);
        }
      });

    return () => controller.abort();
  }, [canView]);

  useEffect(() => {
    if (!canView || selectedPeriodId === null) return;

    const controller = new AbortController();

    void getAdminMembers(
      { period_id: selectedPeriodId },
      { signal: controller.signal },
    )
      .then((result) => {
        if (controller.signal.aborted) return;

        setMembers(result.items);
        setMembersError("");
        setMembersLoadedPeriodId(selectedPeriodId);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        setMembers([]);
        setMembersError(
          getApiErrorMessage(
            err,
            "Daftar anggota gagal dimuat.",
          ),
        );
        setMembersLoadedPeriodId(selectedPeriodId);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setMembersRefreshing(false);
        }
      });

    return () => controller.abort();
  }, [canView, selectedPeriodId, membersRefreshKey]);

  const memberCounts = useMemo(() => {
    const counts = new Map<number, number>();
    members.forEach((member) => {
      if (member.division_id !== null) {
        counts.set(member.division_id, (counts.get(member.division_id) ?? 0) + 1);
      }
    });
    return counts;
  }, [members]);

  if (!admin) return null;

  const selectedPeriod = periods.find((period) => period.id === selectedPeriodId) ?? null;

  const divisionsLoading =
    selectedPeriodId !== null &&
    (divisionsLoadedPeriodId !== selectedPeriodId || divisionsRefreshing);

  const membersLoading =
    selectedPeriodId !== null &&
    (membersLoadedPeriodId !== selectedPeriodId || membersRefreshing);

  function reloadPeriods() {
    setPeriodsError("");
    setPeriodsLoading(true);
    setPeriodsRefreshKey((current) => current + 1);
  }

  function reloadDivisions() {
    setDivisionsError("");
    setDivisionsRefreshing(true);
    setDivisionsRefreshKey((current) => current + 1);
  }

  function reloadMembers() {
    setMembersError("");
    setMembersRefreshing(true);
    setMembersRefreshKey((current) => current + 1);
  }

  function resetPeriodData() {
    setDivisions([]);
    setDivisionsError("");
    setDivisionsLoadedPeriodId(null);
    setDivisionsRefreshing(false);
    setMembers([]);
    setMembersError("");
    setMembersLoadedPeriodId(null);
    setMembersRefreshing(false);
  }

  function selectPeriod(periodId: number) {
    if (periodId === selectedPeriodId) return;
    resetPeriodData();
    setSelectedPeriodId(periodId);
  }

  function openConfirm(open: () => void) {
    setConfirmError("");
    open();
  }

  async function runConfirm(action: () => Promise<void>, fallback: string) {
    setConfirmBusy(true);
    setConfirmError("");
    try {
      await action();
    } catch (err) {
      setConfirmError(getApiErrorMessage(err, fallback));
    } finally {
      setConfirmBusy(false);
    }
  }

  async function savePeriod(values: PeriodFormValues) {
    if (periodFormTarget?.period) {
      const updated = await updateAdminPeriod(periodFormTarget.period.id, values);
      setPeriods((current) => current.map((period) => (period.id === updated.id ? updated : period)));
      toast("Periode diperbarui.");
      reloadPeriods();
      return;
    }

    const created = await createAdminPeriod({ ...values, is_active: false });
    setPeriods((current) => [created, ...current.filter((period) => period.id !== created.id)]);
    resetPeriodData();
    setSelectedPeriodId(created.id);
    setTab("ref");
    toast("Periode dibuat. Lanjutkan dengan menyalin divisi.");
    reloadPeriods();
  }

  function activatePeriod(period: AdminPeriod) {
    void runConfirm(async () => {
      const response = await activateAdminPeriod(period.id);
      setPeriods((current) =>
        current.map((item) =>
          item.id === response.period.id ? response.period : { ...item, is_active: false },
        ),
      );
      setActivateTarget(null);
      toast(
        response.warnings.length
          ? `Periode ${period.name} aktif. Catatan: ${response.warnings.join("; ")}.`
          : `Periode ${period.name} sekarang aktif.`,
      );
      reloadPeriods();
    }, "Periode gagal diaktifkan.");
  }

  function removePeriod(period: AdminPeriod) {
    void runConfirm(async () => {
      await deleteAdminPeriod(period.id);
      const remaining = periods.filter((item) => item.id !== period.id);
      setPeriods(remaining);
      if (selectedPeriodId === period.id) {
        resetPeriodData();
        setSelectedPeriodId(remaining.find((item) => item.is_active)?.id ?? remaining[0]?.id ?? null);
      }
      setDeletePeriodTarget(null);
      toast("Periode dihapus.");
      reloadPeriods();
    }, "Periode gagal dihapus.");
  }

  async function saveDivision(values: DivisionFormValues) {
    if (!selectedPeriod) throw new Error("Pilih periode terlebih dahulu.");

    if (divisionFormTarget?.division) {
      await updateAdminDivision(divisionFormTarget.division.id, values);
      toast("Divisi diperbarui.");
    } else {
      await createAdminDivision({ period_id: selectedPeriod.id, ...values });
      toast("Divisi ditambahkan.");
    }
    reloadDivisions();
  }

  function removeDivision(division: AdminDivision) {
    void runConfirm(async () => {
      await deleteAdminDivision(division.id);
      setDivisions((current) => current.filter((item) => item.id !== division.id));
      setDeleteDivisionTarget(null);
      setDivisionFormTarget(null);
      toast("Divisi dihapus.");
    }, "Divisi gagal dihapus.");
  }

  /**
   * Pindah satu langkah ke atas/bawah, lalu beri urutan ulang 10, 20, 30, ...
   * Hanya divisi yang angkanya berubah yang dikirim ke backend.
   */
  async function moveDivision(division: AdminDivision, direction: -1 | 1) {
    const from = divisions.findIndex((item) => item.id === division.id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= divisions.length) return;

    const reordered = [...divisions];
    [reordered[from], reordered[to]] = [reordered[to], reordered[from]];
    const renumbered = reordered.map((item, index) => ({ ...item, sort_order: (index + 1) * 10 }));
    const changed = renumbered.filter(
      (item) => divisions.find((old) => old.id === item.id)?.sort_order !== item.sort_order,
    );

    setDivisions(renumbered);
    setMoving(true);
    try {
      await Promise.all(
        changed.map((item) =>
          updateAdminDivision(item.id, {
            name: item.name,
            description: item.description,
            sort_order: item.sort_order,
          }),
        ),
      );
    } catch (err) {
      toast(getApiErrorMessage(err, "Urutan divisi gagal disimpan."), "error");
      reloadDivisions();
    } finally {
      setMoving(false);
    }
  }

  async function saveMember(values: MemberFormValues) {
    if (!selectedPeriod) throw new Error("Pilih periode terlebih dahulu.");

    if (memberFormTarget?.member) {
      await updateAdminMember(memberFormTarget.member.id, { period_id: selectedPeriod.id, ...values });
      toast("Data anggota diperbarui.");
    } else {
      await createAdminMember({ period_id: selectedPeriod.id, ...values });
      toast("Anggota ditambahkan.");
    }
    reloadMembers();
  }

  async function removeMember(member: AdminMember) {
    await deleteAdminMember(member.id);
    toast("Anggota dihapus.");
    reloadMembers();
  }

  function requestDeleteMember(member: AdminMember) {
    setMemberFormTarget(null);
    setDeleteMemberTarget(member);
  }

  async function copyDivisions(sourcePeriodId: number): Promise<DivisionCopyResponse> {
    if (!selectedPeriod) throw new Error("Pilih periode tujuan terlebih dahulu.");
    const response = await copyAdminDivisions(selectedPeriod.id, { source_period_id: sourcePeriodId });
    reloadDivisions();
    return response;
  }

  const showChecklist =
    canManage &&
    selectedPeriod !== null &&
    !selectedPeriod.is_active &&
    !divisionsLoading &&
    !membersLoading &&
    (divisions.length === 0 || members.length === 0);

  const activeOther = periods.find((period) => period.is_active && period.id !== activateTarget?.id);
  const activateMissing =
    activateTarget && activateTarget.id === selectedPeriodId && !divisionsLoading && !membersLoading
      ? [divisions.length === 0 && "divisi", members.length === 0 && "anggota"].filter(Boolean).join(" dan ")
      : "";

  let content;
  if (periodsLoading && periods.length === 0) {
    content = (
      <div role="status" aria-label="Memuat periode" className="grid grid-cols-[repeat(auto-fill,minmax(230px,1fr))] gap-2.5">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-[118px] animate-pulse rounded-[4px] bg-green-900/5" />
        ))}
      </div>
    );
  } else if (periodsError && periods.length === 0) {
    content = (
      <div className="rounded-[4px] border border-line bg-white">
        <StateBlock
          tone="error"
          icon={<RefreshCw />}
          label="Gagal memuat"
          title="Periode tidak dapat dimuat"
          action={
            <Button variant="outline" onClick={reloadPeriods}>
              <RefreshCw aria-hidden="true" /> Coba lagi
            </Button>
          }
        >
          {periodsError}
        </StateBlock>
      </div>
    );
  } else if (!selectedPeriod) {
    content = (
      <div className="rounded-[4px] border border-line bg-white">
        <StateBlock
          icon={<CalendarPlus />}
          label="Struktur organisasi"
          title="Belum ada periode"
          action={
            canManage ? (
              <Button onClick={() => setPeriodFormTarget({})}>Buat periode pertama</Button>
            ) : undefined
          }
        >
          Buat periode kepengurusan untuk mulai mengisi divisi dan anggota.
        </StateBlock>
      </div>
    );
  } else {
    content = (
      <>
        <PeriodStrip
          periods={periods}
          selectedId={selectedPeriodId}
          selectedCounts={
            divisionsLoading || membersLoading
              ? null
              : { divisions: divisions.length, members: members.length }
          }
          canManage={canManage}
          onSelect={selectPeriod}
          onEdit={(period) => setPeriodFormTarget({ period })}
          onActivate={(period) => openConfirm(() => setActivateTarget(period))}
          onDelete={(period) => openConfirm(() => setDeletePeriodTarget(period))}
        />

        {showChecklist ? (
          <PeriodChecklist
            period={selectedPeriod}
            divisionCount={divisions.length}
            memberCount={members.length}
            onCopy={() => setIsCopyOpen(true)}
            onOpenDivisions={() => setTab("ref")}
            onAddMember={() => setMemberFormTarget({ divisionId: null })}
            onActivate={() => openConfirm(() => setActivateTarget(selectedPeriod))}
          />
        ) : null}

        <Tabs<Tab>
          label="Tampilan struktur"
          value={tab}
          onChange={setTab}
          options={[
            { value: "members", label: "Anggota", count: membersLoading ? undefined : members.length },
            { value: "ref", label: "Divisi & jabatan", count: divisionsLoading ? undefined : divisions.length },
          ]}
        />

        {tab === "ref" ? (
          <div className="grid grid-cols-1 items-start gap-5 min-[1101px]:grid-cols-[minmax(0,1fr)_320px]">
            <DivisionsSection
              periodName={selectedPeriod.name}
              divisions={divisions}
              memberCounts={memberCounts}
              isLoading={divisionsLoading}
              error={divisionsError}
              canManage={canManage}
              moving={moving}
              onReload={reloadDivisions}
              onCreate={() => setDivisionFormTarget({})}
              onEdit={(division) => setDivisionFormTarget({ division })}
              onDelete={(division) => openConfirm(() => setDeleteDivisionTarget(division))}
              onCopy={() => setIsCopyOpen(true)}
              onMove={(division, direction) => void moveDivision(division, direction)}
            />
            <PositionsCard positions={positionsLoading ? [] : positions} error={positionsError} />
          </div>
        ) : (
          <MembersSection
            key={selectedPeriod.id}
            divisions={divisions}
            members={members}
            positions={positions}
            positionsLoading={positionsLoading}
            positionsError={positionsError}
            isLoading={membersLoading}
            error={membersError}
            onReload={reloadMembers}
            onCreate={(divisionId) => setMemberFormTarget({ divisionId: divisionId ?? null })}
            onEdit={(member) => setMemberFormTarget({ member })}
            canManage={canManage}
            onCopyDivisions={() => setIsCopyOpen(true)}
          />
        )}
      </>
    );
  }

  return (
    <RequirePermission permission={PERMISSIONS.ORGANIZATION_VIEW}>
      <AdminPage>
        <PageHead
          label="Organisasi"
          title="Struktur Organisasi"
          description="Kelola periode kepengurusan, divisi, dan anggota. Periode aktif ditampilkan di halaman Struktur situs."
          actions={
            canManage ? (
              <>
                <Button variant="outline" onClick={() => setPeriodFormTarget({})}>
                  <Plus aria-hidden="true" /> Periode baru
                </Button>
                <Button disabled={!selectedPeriod} onClick={() => setMemberFormTarget({ divisionId: null })}>
                  <Plus aria-hidden="true" /> Tambah anggota
                </Button>
              </>
            ) : undefined
          }
        />

        {!canManage ? (
          <Notice icon={<Eye aria-hidden="true" />} className="mb-4">
            <strong>Mode lihat saja.</strong> Akun Anda dapat melihat struktur organisasi
            tetapi tidak dapat mengubahnya (butuh izin “Mengelola struktur”).
          </Notice>
        ) : null}

        {periodsError && periods.length > 0 ? (
          <Notice tone="amber" icon={<AlertTriangle aria-hidden="true" />} className="mb-4">
            Daftar periode gagal diperbarui. {periodsError}
          </Notice>
        ) : null}

        {content}

        {periodFormTarget && canManage ? (
          <PeriodFormDialog
            key={periodFormTarget.period?.id ?? "create"}
            period={periodFormTarget.period}
            onClose={() => setPeriodFormTarget(null)}
            onSubmit={savePeriod}
          />
        ) : null}

        <ConfirmDialog
          open={activateTarget !== null}
          tone="default"
          eyebrow="Aktifkan periode"
          title={`Aktifkan periode ${activateTarget?.name ?? ""}?`}
          description={
            <>
              Situs publik akan langsung menampilkan struktur periode {activateTarget?.name}.
              {activeOther ? ` Periode ${activeOther.name} otomatis menjadi tidak aktif.` : ""}
              {activateMissing ? (
                <Notice tone="amber" icon={<AlertTriangle aria-hidden="true" />} className="mt-3.5 text-left">
                  <strong>Periode ini belum memiliki {activateMissing}.</strong> Halaman Struktur
                  di situs akan tampil kosong sampai datanya diisi. Anda tetap bisa mengaktifkannya.
                </Notice>
              ) : null}
            </>
          }
          confirmLabel="Aktifkan periode"
          busyLabel="Mengaktifkan..."
          busy={confirmBusy}
          error={confirmError}
          onCancel={() => setActivateTarget(null)}
          onConfirm={() => activateTarget && activatePeriod(activateTarget)}
        />

        <ConfirmDialog
          open={deletePeriodTarget !== null}
          eyebrow="Hapus periode"
          title={`Hapus periode ${deletePeriodTarget?.name ?? ""}?`}
          description="Periode hanya bisa dihapus bila tidak aktif dan benar-benar kosong (tanpa divisi, anggota, dan program kerja)."
          confirmLabel="Hapus"
          busyLabel="Menghapus..."
          busy={confirmBusy}
          error={confirmError}
          onCancel={() => setDeletePeriodTarget(null)}
          onConfirm={() => deletePeriodTarget && removePeriod(deletePeriodTarget)}
        />

        {divisionFormTarget && canManage && selectedPeriod ? (
          <DivisionFormDialog
            key={divisionFormTarget.division?.id ?? "create"}
            period={selectedPeriod}
            division={divisionFormTarget.division}
            defaultSortOrder={nextSortOrder(divisions)}
            onDelete={
              divisionFormTarget.division
                ? () => openConfirm(() => setDeleteDivisionTarget(divisionFormTarget.division ?? null))
                : undefined
            }
            onClose={() => setDivisionFormTarget(null)}
            onSubmit={saveDivision}
          />
        ) : null}

        <ConfirmDialog
          open={deleteDivisionTarget !== null}
          eyebrow="Hapus divisi"
          title={`Hapus ${deleteDivisionTarget?.name ?? "divisi"}?`}
          description="Divisi dihapus dari periode ini. Divisi yang masih punya anggota atau dipakai program kerja tidak bisa dihapus."
          confirmLabel="Hapus"
          busyLabel="Menghapus..."
          busy={confirmBusy}
          error={confirmError}
          onCancel={() => setDeleteDivisionTarget(null)}
          onConfirm={() => deleteDivisionTarget && removeDivision(deleteDivisionTarget)}
        />

        {isCopyOpen && canManage && selectedPeriod ? (
          <DivisionCopyDialog
            targetPeriod={selectedPeriod}
            periods={periods}
            onClose={() => setIsCopyOpen(false)}
            onCopy={copyDivisions}
          />
        ) : null}

        {memberFormTarget && canManage && selectedPeriod ? (
          <MemberFormDialog
            key={
              memberFormTarget.member
                ? `edit-${memberFormTarget.member.id}`
                : `create-${memberFormTarget.divisionId ?? "none"}`
            }
            period={selectedPeriod}
            member={memberFormTarget.member}
            divisions={divisions}
            positions={positions}
            defaultDivisionId={memberFormTarget.divisionId ?? null}
            defaultSortOrder={nextSortOrder(members)}
            onClose={() => setMemberFormTarget(null)}
            onSubmit={saveMember}
            onRequestDelete={requestDeleteMember}
          />
        ) : null}

        {deleteMemberTarget && canManage && selectedPeriod ? (
          <MemberDeleteDialog
            member={deleteMemberTarget}
            periodName={selectedPeriod.name}
            onClose={() => setDeleteMemberTarget(null)}
            onConfirm={() => removeMember(deleteMemberTarget)}
          />
        ) : null}
      </AdminPage>
    </RequirePermission>
  );
}