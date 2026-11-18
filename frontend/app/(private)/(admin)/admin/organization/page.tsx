"use client";

import { useEffect, useState } from "react";

import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import {
  activateAdminPeriod,
  copyAdminDivisions,
  createAdminDivision,
  createAdminPeriod,
  deleteAdminDivision,
  deleteAdminPeriod,
  getAdminDivisions,
  getAdminPeriods,
  updateAdminDivision,
  updateAdminPeriod,
} from "@/features/organization/admin-api";
import { getOrganizationErrorMessage } from "@/features/organization/errors";

import DivisionCopyDialog from "@/features/organization/components/admin/DivisionCopyDialog";
import DivisionDeleteDialog from "@/features/organization/components/admin/DivisionDeleteDialog";
import DivisionFormDialog from "@/features/organization/components/admin/DivisionFormDialog";
import DivisionsSection from "@/features/organization/components/admin/DivisionsSection";
import { OrganizationNotice } from "@/features/organization/components/admin/OrganizationPrimitives";
import PeriodActivateDialog from "@/features/organization/components/admin/PeriodActivateDialog";
import PeriodChecklist from "@/features/organization/components/admin/PeriodChecklist";
import PeriodDeleteDialog from "@/features/organization/components/admin/PeriodDeleteDialog";
import PeriodFormDialog from "@/features/organization/components/admin/PeriodFormDialog";
import PeriodToolbar from "@/features/organization/components/admin/PeriodToolbar";

import type { DivisionFormValues } from "@/features/organization/components/admin/DivisionFormDialog";
import type { PeriodFormValues } from "@/features/organization/components/admin/PeriodFormDialog";
import type {
  AdminDivision,
  AdminPeriod,
  DivisionCopyResponse,
} from "@/features/organization/types";

function sortDivisions(items: AdminDivision[]): AdminDivision[] {
  return [...items].sort(
    (first, second) =>
      first.sort_order - second.sort_order ||
      first.name.localeCompare(second.name, "id"),
  );
}

interface ActivateTarget {
  period: AdminPeriod;
  previousActive: AdminPeriod | null;
}

export default function OrganizationPage() {
  const { admin, can } = useAuth();

  const canView = can(PERMISSIONS.ORGANIZATION_VIEW);
  const canManage = can(PERMISSIONS.ORGANIZATION_MANAGE);

  const [periods, setPeriods] = useState<AdminPeriod[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodsError, setPeriodsError] = useState("");
  const [periodsRefreshKey, setPeriodsRefreshKey] = useState(0);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(
    null,
  );

  const [divisions, setDivisions] = useState<AdminDivision[]>([]);
  const [divisionsError, setDivisionsError] = useState("");
  const [divisionsRefreshKey, setDivisionsRefreshKey] = useState(0);
  const [divisionsLoadedPeriodId, setDivisionsLoadedPeriodId] = useState<
    number | null
  >(null);
  const [divisionsRefreshing, setDivisionsRefreshing] = useState(false);

  const [periodFormTarget, setPeriodFormTarget] = useState<{
    period?: AdminPeriod;
  } | null>(null);

  const [activateTarget, setActivateTarget] =
    useState<ActivateTarget | null>(null);

  const [deletePeriodTarget, setDeletePeriodTarget] =
    useState<AdminPeriod | null>(null);

  const [divisionFormTarget, setDivisionFormTarget] = useState<{
    division?: AdminDivision;
  } | null>(null);

  const [deleteDivisionTarget, setDeleteDivisionTarget] =
    useState<AdminDivision | null>(null);

  const [isCopyOpen, setIsCopyOpen] = useState(false);

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
          getOrganizationErrorMessage(
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
          getOrganizationErrorMessage(
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

  if (!admin) return null;

  const selectedPeriod =
    periods.find((period) => period.id === selectedPeriodId) ?? null;

  const divisionsLoading =
    selectedPeriodId !== null &&
    (divisionsLoadedPeriodId !== selectedPeriodId || divisionsRefreshing);

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

  function selectPeriod(periodId: number) {
    if (periodId === selectedPeriodId) return;

    setDivisions([]);
    setDivisionsError("");
    setDivisionsLoadedPeriodId(null);
    setDivisionsRefreshing(false);
    setSelectedPeriodId(periodId);
  }

  async function savePeriod(values: PeriodFormValues) {
    if (periodFormTarget?.period) {
      const updated = await updateAdminPeriod(periodFormTarget.period.id, {
        name: values.name,
        start_date: values.start_date,
        end_date: values.end_date,
      });

      setPeriods((current) =>
        current.map((period) =>
          period.id === updated.id ? updated : period,
        ),
      );
      reloadPeriods();
      return;
    }

    const created = await createAdminPeriod({
      name: values.name,
      start_date: values.start_date,
      end_date: values.end_date,
      is_active: false,
    });

    setPeriods((current) => [
      created,
      ...current.filter((period) => period.id !== created.id),
    ]);
    setDivisions([]);
    setDivisionsError("");
    setDivisionsLoadedPeriodId(null);
    setDivisionsRefreshing(false);
    setSelectedPeriodId(created.id);
    reloadPeriods();
  }

  function openActivateDialog(period: AdminPeriod) {
    setActivateTarget({
      period,
      previousActive:
        periods.find((item) => item.is_active && item.id !== period.id) ??
        null,
    });
  }

  async function activatePeriod(period: AdminPeriod): Promise<string[]> {
    const response = await activateAdminPeriod(period.id);

    setPeriods((current) =>
      current.map((item) =>
        item.id === response.period.id
          ? response.period
          : { ...item, is_active: false },
      ),
    );
    reloadPeriods();

    return response.warnings;
  }

  async function removePeriod(period: AdminPeriod) {
    await deleteAdminPeriod(period.id);

    const remaining = periods.filter((item) => item.id !== period.id);

    setPeriods(remaining);

    if (selectedPeriodId === period.id) {
      const nextPeriod =
        remaining.find((item) => item.is_active) ?? remaining[0] ?? null;

      setDivisions([]);
      setDivisionsError("");
      setDivisionsLoadedPeriodId(null);
      setDivisionsRefreshing(false);
      setSelectedPeriodId(nextPeriod?.id ?? null);
    }

    reloadPeriods();
  }

  async function saveDivision(values: DivisionFormValues) {
    if (!selectedPeriod) {
      throw new Error("Pilih periode terlebih dahulu.");
    }

    if (divisionFormTarget?.division) {
      await updateAdminDivision(divisionFormTarget.division.id, values);
    } else {
      await createAdminDivision({
        period_id: selectedPeriod.id,
        ...values,
      });
    }

    reloadDivisions();
  }

  async function removeDivision(division: AdminDivision) {
    await deleteAdminDivision(division.id);
    reloadDivisions();
  }

  async function copyDivisions(
    sourcePeriodId: number,
  ): Promise<DivisionCopyResponse> {
    if (!selectedPeriod) {
      throw new Error("Pilih periode tujuan terlebih dahulu.");
    }

    const response = await copyAdminDivisions(selectedPeriod.id, {
      source_period_id: sourcePeriodId,
    });

    reloadDivisions();

    return response;
  }

  return (
    <RequirePermission permission={PERMISSIONS.ORGANIZATION_VIEW}>
      <main className="min-h-screen bg-bg-light text-ink">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <header className="border-b border-paper-line pb-5">
            <p className="text-xs font-semibold tracking-widest text-gold uppercase">
              Organisasi / Struktur
            </p>

            <h1 className="mt-3 font-serif text-3xl font-semibold text-bg-dark sm:text-4xl">
              Struktur Organisasi
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
              Kelola periode kepengurusan dan divisi. Periode aktif
              ditampilkan di halaman Struktur situs publik.
            </p>
          </header>

          {!canManage && (
            <div className="mt-5">
              <OrganizationNotice tone="info">
                <strong>Mode lihat saja.</strong> Akun ini dapat melihat data
                struktur organisasi tetapi tidak dapat mengubahnya (butuh izin{" "}
                <code>organization.manage</code>).
              </OrganizationNotice>
            </div>
          )}

          <PeriodToolbar
            periods={periods}
            selectedPeriod={selectedPeriod}
            isLoading={periodsLoading}
            error={periodsError}
            onReload={reloadPeriods}
            onSelect={selectPeriod}
            onCreate={() => setPeriodFormTarget({})}
            onEdit={(period) => setPeriodFormTarget({ period })}
            onActivate={openActivateDialog}
            onDelete={setDeletePeriodTarget}
          />

          {selectedPeriod && !selectedPeriod.is_active && (
            <PeriodChecklist
              period={selectedPeriod}
              divisionCount={divisions.length}
              divisionsLoading={divisionsLoading}
              onActivate={openActivateDialog}
            />
          )}

          {selectedPeriod && (
            <DivisionsSection
              periodName={selectedPeriod.name}
              divisions={divisions}
              isLoading={divisionsLoading}
              error={divisionsError}
              onReload={reloadDivisions}
              onCreate={() => setDivisionFormTarget({})}
              onEdit={(division) => setDivisionFormTarget({ division })}
              onDelete={setDeleteDivisionTarget}
              onCopy={() => setIsCopyOpen(true)}
            />
          )}

          {periodFormTarget && canManage && (
            <PeriodFormDialog
              key={periodFormTarget.period?.id ?? "create"}
              period={periodFormTarget.period}
              onClose={() => setPeriodFormTarget(null)}
              onSubmit={savePeriod}
            />
          )}

          {activateTarget && canManage && (
            <PeriodActivateDialog
              key={activateTarget.period.id}
              period={activateTarget.period}
              activePeriod={activateTarget.previousActive}
              onClose={() => setActivateTarget(null)}
              onActivate={() => activatePeriod(activateTarget.period)}
            />
          )}

          {deletePeriodTarget && canManage && (
            <PeriodDeleteDialog
              period={deletePeriodTarget}
              onClose={() => setDeletePeriodTarget(null)}
              onConfirm={() => removePeriod(deletePeriodTarget)}
            />
          )}

          {divisionFormTarget && canManage && selectedPeriod && (
            <DivisionFormDialog
              key={divisionFormTarget.division?.id ?? "create"}
              period={selectedPeriod}
              division={divisionFormTarget.division}
              defaultSortOrder={divisions.length}
              onClose={() => setDivisionFormTarget(null)}
              onSubmit={saveDivision}
            />
          )}

          {deleteDivisionTarget && canManage && (
            <DivisionDeleteDialog
              division={deleteDivisionTarget}
              onClose={() => setDeleteDivisionTarget(null)}
              onConfirm={() => removeDivision(deleteDivisionTarget)}
            />
          )}

          {isCopyOpen && canManage && selectedPeriod && (
            <DivisionCopyDialog
              targetPeriod={selectedPeriod}
              periods={periods}
              onClose={() => setIsCopyOpen(false)}
              onCopy={copyDivisions}
            />
          )}
        </div>
      </main>
    </RequirePermission>
  );
}
