"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/features/auth/AuthContext";

import {
  createAdminProgram,
  deleteAdminProgram,
  getAdminPrograms,
  updateAdminProgram,
} from "@/features/programs/admin-api";

import { getAdminPeriods } from "@/features/organization/admin-api";

import type {
  AdminProgram,
  CreateProgramPayload,
} from "@/features/programs/types";
import type { AdminPeriod } from "@/features/organization/types";

import ProgramsList from "@/features/programs/components/admin/ProgramsList";
import ProgramFormDialog from "@/features/programs/components/admin/ProgramFormDialog";
import ProgramDeleteDialog from "@/features/programs/components/admin/ProgramDeleteDialog";

const PAGE_SIZE = 20;

type ProgramFormTarget = {
  mode: "create" | "edit";
  program?: AdminProgram;
};

export default function ProgramsPage() {
  const { admin } = useAuth();

  const canView = admin?.permissions.includes("programs.view") ?? false;
  const canManage =
    admin?.permissions.includes("programs.manage") ?? false;

  const [items, setItems] = useState<AdminProgram[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const [periods, setPeriods] = useState<AdminPeriod[]>([]);
  const [periodsLoading, setPeriodsLoading] = useState(true);
  const [periodsError, setPeriodsError] = useState("");

  const [formTarget, setFormTarget] =
    useState<ProgramFormTarget | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<AdminProgram | null>(null);

  useEffect(() => {
    if (!canView) return;

    const controller = new AbortController();

    async function loadPrograms() {
      try {
        const result = await getAdminPrograms(
          {
            offset,
            limit: PAGE_SIZE + 1,
          },
          {
            signal: controller.signal,
          },
        );

        if (controller.signal.aborted) return;

        setItems(result.items.slice(0, PAGE_SIZE));
        setHasNextPage(result.items.length > PAGE_SIZE);
        setListError("");
      } catch (err) {
        if (controller.signal.aborted) return;

        setListError(
          err instanceof Error
            ? err.message
            : "Daftar program kerja gagal dimuat.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadPrograms();

    return () => controller.abort();
  }, [canView, offset, refreshKey]);

  useEffect(() => {
    if (!canManage) return;

    const controller = new AbortController();

    void getAdminPeriods({
      signal: controller.signal,
    })
      .then((result) => {
        setPeriods(result.items);
        setPeriodsError("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;

        setPeriodsError(
          err instanceof Error
            ? err.message
            : "Daftar periode gagal dimuat.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setPeriodsLoading(false);
        }
      });

    return () => controller.abort();
  }, [canManage]);

  if (!admin) return null;

  if (!canView) {
    return (
      <main className="min-h-screen bg-bg-light px-4 py-8 text-ink">
        <section className="mx-auto max-w-5xl border border-paper-line p-6">
          <h1 className="font-serif text-2xl font-semibold text-bg-dark">
            Akses tidak tersedia
          </h1>

          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Akun ini belum memiliki izin programs.view untuk melihat
            program kerja.
          </p>
        </section>
      </main>
    );
  }

  function reloadPrograms() {
    setListError("");
    setIsLoading(true);
    setRefreshKey((current) => current + 1);
  }

  function changePage(nextOffset: number) {
    setListError("");
    setIsLoading(true);
    setOffset(Math.max(0, nextOffset));
  }

  async function saveProgram(payload: CreateProgramPayload) {
    if (!formTarget) return;

    if (formTarget.program) {
      await updateAdminProgram(formTarget.program.id, payload);
    } else {
      await createAdminProgram(payload);
    }

    reloadPrograms();
  }

  async function removeProgram() {
    if (!deleteTarget) return;

    await deleteAdminProgram(deleteTarget.id);
    reloadPrograms();
  }

  const canCreate =
    canManage &&
    !periodsLoading &&
    !periodsError &&
    periods.length > 0;

  return (
    <main className="min-h-screen bg-bg-light text-ink">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="border-b border-paper-line pb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold">
            Konten / Program kerja
          </p>

          <h1 className="mt-3 font-serif text-3xl font-semibold text-bg-dark sm:text-4xl">
            Manajemen Program
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-soft">
            Kelola program kerja berdasarkan periode organisasi,
            mulai dari perencanaan hingga pelaksanaan.
          </p>
        </header>

        {canManage && periodsError && (
          <div
            role="alert"
            className="mt-5 border border-gold/40 bg-gold/10 p-4 text-sm leading-6 text-ink"
          >
            Daftar periode tidak bisa dimuat. Pastikan akun memiliki
            permission organization.view. Membuat program baru memerlukan
            data periode.
          </div>
        )}

        <ProgramsList
          items={items}
          periods={periods}
          isLoading={isLoading}
          error={listError}
          offset={offset}
          hasNextPage={hasNextPage}
          canManage={canManage}
          onReload={reloadPrograms}
          onPageChange={changePage}
          onCreate={() => {
            if (canCreate) {
              setFormTarget({ mode: "create" });
            }
          }}
          onEdit={(program) =>
            setFormTarget({
              mode: "edit",
              program,
            })
          }
          onDelete={setDeleteTarget}
        />

        {formTarget && canManage && (
          <ProgramFormDialog
            key={
              formTarget.program
                ? `edit-${formTarget.program.id}`
                : "create"
            }
            program={formTarget.program}
            periods={periods}
            periodsError={periodsError}
            onClose={() => setFormTarget(null)}
            onSubmit={saveProgram}
          />
        )}

        {deleteTarget && canManage && (
          <ProgramDeleteDialog
            program={deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={removeProgram}
          />
        )}
      </div>
    </main>
  );
}