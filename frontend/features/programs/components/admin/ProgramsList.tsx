"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Eye, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { Pager, Table, Td, Th, Tr } from "@/components/admin/shared/DataTable";
import { SearchInput, Segmented, SelectSm, Toolbar } from "@/components/admin/shared/ListControls";
import { Notice } from "@/components/admin/shared/Notice";
import { PageHead } from "@/components/admin/shared/PageHead";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { useToast } from "@/components/admin/shared/Toast";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import { getAdminDivisions, getAdminPeriods } from "@/features/organization/admin-api";
import type { AdminDivision, AdminPeriod } from "@/features/organization/types";
import { formatDateShort } from "@/lib/format-date";

import { deleteAdminProgram, getAdminPrograms } from "../../admin-api";
import { normalizeProgramStatus, PROGRAM_STATUS_BADGE, programStatusLabel } from "../../status";
import { PROGRAM_STATUSES, type AdminProgram, type ProgramStatus } from "../../types";
import ProgramFormDialog from "./ProgramFormDialog";

const PER_PAGE = 10;
const FETCH_LIMIT = 100;
const MAX_FETCH_PAGES = 10;

type StatusFilter = "all" | ProgramStatus;
type FormTarget = { program?: AdminProgram } | null;

/** Backend belum punya filter/total, jadi semua program (maks. 1.000) dimuat sekali. */
async function loadAllPrograms(signal: AbortSignal): Promise<AdminProgram[]> {
  const all: AdminProgram[] = [];
  for (let page = 0; page < MAX_FETCH_PAGES; page++) {
    const result = await getAdminPrograms({ offset: page * FETCH_LIMIT, limit: FETCH_LIMIT }, { signal });
    all.push(...result.items);
    if (result.items.length < FETCH_LIMIT) break;
  }
  return all;
}

function schedule(program: AdminProgram) {
  if (!program.start_date) return null;
  const start = formatDateShort(program.start_date);
  const end = formatDateShort(program.end_date);
  return end ? `${start} – ${end}` : start;
}

/** Halaman daftar program kerja, mengikuti `viewPrograms()` di Design/admin. */
export default function ProgramsList() {
  const { can } = useAuth();
  const toast = useToast();
  const manage = can(PERMISSIONS.PROGRAMS_MANAGE);

  const [programs, setPrograms] = useState<AdminProgram[] | null>(null);
  const [periods, setPeriods] = useState<AdminPeriod[]>([]);
  const [divisions, setDivisions] = useState<AdminDivision[]>([]);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [periodId, setPeriodId] = useState<string | null>(null);
  const [divisionId, setDivisionId] = useState("");
  const [page, setPage] = useState(1);

  const [formTarget, setFormTarget] = useState<FormTarget>(null);
  const [deleting, setDeleting] = useState<AdminProgram | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      loadAllPrograms(controller.signal),
      getAdminPeriods({ signal: controller.signal }),
      getAdminDivisions(undefined, { signal: controller.signal }),
    ])
      .then(([programItems, periodResult, divisionResult]) => {
        setPrograms(programItems);
        setPeriods(periodResult.items);
        setDivisions(divisionResult.items);
        // Default: periode aktif (sekali saja, tidak menimpa pilihan pengguna).
        setPeriodId((current) =>
          current ?? String(periodResult.items.find((p) => p.is_active)?.id ?? ""),
        );
        setError("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Program kerja gagal dimuat.");
      });

    return () => controller.abort();
  }, [reloadKey]);

  const period = periodId ?? "";
  const periodName = (id: number) => periods.find((p) => p.id === id)?.name ?? "—";
  const divisionName = (id: number | null) =>
    (id !== null && divisions.find((d) => d.id === id)?.name) || "Tanpa divisi";

  const inPeriod = useMemo(
    () => (programs ?? []).filter((p) => !period || String(p.period_id) === period),
    [programs, period],
  );

  const counts = useMemo(() => {
    const result: Record<StatusFilter, number> = { all: inPeriod.length, planned: 0, ongoing: 0, completed: 0, cancelled: 0 };
    inPeriod.forEach((p) => {
      const s = normalizeProgramStatus(p.status);
      if (s) result[s]++;
    });
    return result;
  }, [inPeriod]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inPeriod
      .filter(
        (p) =>
          (status === "all" || normalizeProgramStatus(p.status) === status) &&
          (!divisionId || String(p.division_id) === divisionId) &&
          (!q || p.name.toLowerCase().includes(q)),
      )
      .sort(
        (a, b) =>
          (a.start_date ?? "9999").localeCompare(b.start_date ?? "9999") ||
          a.name.localeCompare(b.name, "id"),
      );
  }, [inPeriod, status, divisionId, query]);

  const pageRows = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const periodDivisions = divisions
    .filter((d) => String(d.period_id) === period)
    .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id);

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setDivisionId("");
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await deleteAdminProgram(deleting.id);
      setPrograms((current) => current?.filter((p) => p.id !== deleting.id) ?? null);
      setDeleting(null);
      toast("Program kerja dihapus.");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Program kerja gagal dihapus.");
    } finally {
      setDeleteBusy(false);
    }
  }

  const addButton = (label: string) =>
    manage ? (
      <Button onClick={() => setFormTarget({})}>
        <Plus aria-hidden="true" /> {label}
      </Button>
    ) : undefined;

  let body;
  if (error) {
    body = (
      <StateBlock
        tone="error"
        icon={<RefreshCw />}
        label="Gagal memuat"
        title="Program kerja tidak dapat dimuat"
        action={
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setPrograms(null);
              setReloadKey((key) => key + 1);
            }}
          >
            <RefreshCw aria-hidden="true" /> Coba lagi
          </Button>
        }
      >
        {error}
      </StateBlock>
    );
  } else if (programs === null) {
    body = (
      <div role="status" aria-label="Memuat program kerja" className="grid gap-4 p-4">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="grid animate-pulse gap-2">
            <div className="h-3 w-2/5 rounded-[3px] bg-green-900/5" />
            <div className="h-2.5 w-3/5 rounded-[3px] bg-green-900/5" />
          </div>
        ))}
      </div>
    );
  } else if (programs.length === 0) {
    body = (
      <StateBlock icon={<ClipboardCheck />} label="Program kerja" title="Belum ada program kerja" action={addButton("Tambah program")}>
        Tambahkan program kerja hasil rapat kerja kabinet.
      </StateBlock>
    );
  } else if (inPeriod.length === 0 && !query) {
    body = (
      <StateBlock
        icon={<ClipboardCheck />}
        label={`Periode ${periodName(Number(period))}`}
        title="Periode ini belum punya program kerja"
        action={addButton("Tambah program")}
      >
        Pilih periode lain atau tambahkan program baru.
      </StateBlock>
    );
  } else if (rows.length === 0) {
    body = (
      <StateBlock
        icon={<Search />}
        label="Pencarian"
        title={`Tidak ada hasil untuk “${query.trim() || "filter ini"}”`}
        action={
          <Button variant="outline" onClick={resetFilters}>
            Reset filter
          </Button>
        }
      >
        Periksa ejaan atau ubah filter yang dipakai.
      </StateBlock>
    );
  } else {
    body = (
      <>
        <Table
          head={
            <>
              <Th>Program</Th>
              <Th>Divisi</Th>
              <Th>Status</Th>
              <Th>Jadwal</Th>
              {period ? null : <Th>Periode</Th>}
              <Th>
                <span className="sr-only">Aksi</span>
              </Th>
            </>
          }
        >
          {pageRows.map((program) => {
            const s = normalizeProgramStatus(program.status);
            const badge = s ? PROGRAM_STATUS_BADGE[s] : { tone: "grey" as const };
            const cancelled = s === "cancelled";
            const when = schedule(program);

            return (
              <Tr key={program.id}>
                <Td>
                  <div className={`font-semibold ${cancelled ? "text-muted" : "text-green-900"}`}>
                    {program.name}
                  </div>
                  {program.description ? (
                    <div className="mt-0.5 line-clamp-2 max-w-[56ch] text-xs text-muted">
                      {program.description}
                    </div>
                  ) : null}
                </Td>
                <Td label="Divisi" className={cancelled ? "text-muted" : ""}>
                  {divisionName(program.division_id)}
                </Td>
                <Td label="Status">
                  <Badge tone={badge.tone} dot={badge.dot}>
                    {programStatusLabel(program.status)}
                  </Badge>
                </Td>
                <Td label="Jadwal" className="text-xs whitespace-nowrap">
                  {when ?? <span className="text-muted">Belum dijadwalkan</span>}
                </Td>
                {period ? null : (
                  <Td label="Periode" className="text-xs">
                    {periodName(program.period_id)}
                  </Td>
                )}
                <Td actions>
                  {manage ? (
                    <div className="inline-flex gap-1">
                      <Button variant="outline" size="sm" onClick={() => setFormTarget({ program })}>
                        <Pencil aria-hidden="true" /> Edit
                      </Button>
                      <Button
                        variant="danger-outline"
                        size="icon"
                        className="size-8!"
                        aria-label={`Hapus “${program.name}”`}
                        onClick={() => {
                          setDeleteError("");
                          setDeleting(program);
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  ) : null}
                </Td>
              </Tr>
            );
          })}
        </Table>
        <Pager total={rows.length} page={page} perPage={PER_PAGE} onPage={setPage} />
      </>
    );
  }

  return (
    <>
      <PageHead
        label="Konten"
        title="Program Kerja"
        description="Program kerja kabinet per periode. Ditampilkan di halaman Program Kerja situs."
        actions={addButton("Tambah program")}
      />

      {!manage ? (
        <Notice icon={<Eye aria-hidden="true" />} className="mb-4">
          <strong>Mode lihat saja.</strong> Akun Anda dapat melihat program kerja
          tetapi tidak dapat mengubahnya (butuh izin “Kelola program kerja”).
        </Notice>
      ) : null}

      <Card bodyClassName="p-0">
        <Toolbar>
          <SearchInput
            placeholder="Cari program…"
            aria-label="Cari program"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <SelectSm
            aria-label="Periode"
            value={period}
            onChange={(event) => {
              setPeriodId(event.target.value);
              setDivisionId("");
              setPage(1);
            }}
          >
            <option value="">Semua periode</option>
            {periods.map((p) => (
              <option key={p.id} value={p.id}>
                Periode {p.name}
                {p.is_active ? " (aktif)" : ""}
              </option>
            ))}
          </SelectSm>
          <SelectSm
            aria-label="Divisi"
            value={divisionId}
            disabled={!period}
            onChange={(event) => {
              setDivisionId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua divisi</option>
            {periodDivisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </SelectSm>
        </Toolbar>
        <div className="border-b border-line px-4 pb-3.5 max-[640px]:px-3 max-[640px]:pb-3">
          <Segmented<StatusFilter>
            label="Status"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "Semua", count: counts.all },
              ...PROGRAM_STATUSES.map((s) => ({ value: s, label: programStatusLabel(s), count: counts[s] })),
            ]}
          />
        </div>
        {body}
      </Card>

      {formTarget ? (
        <ProgramFormDialog
          program={formTarget.program}
          periods={periods}
          divisions={divisions}
          defaultPeriodId={period ? Number(period) : undefined}
          onClose={() => setFormTarget(null)}
          onSaved={(saved, isNew) => {
            setPrograms((current) =>
              isNew
                ? [saved, ...(current ?? [])]
                : (current ?? []).map((p) => (p.id === saved.id ? saved : p)),
            );
            setFormTarget(null);
            toast(isNew ? "Program kerja ditambahkan." : "Program kerja diperbarui.");
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus program kerja?"
        description={`“${deleting?.name ?? ""}” akan dihapus dari situs dan tidak bisa dikembalikan.`}
        confirmLabel="Hapus"
        busyLabel="Menghapus..."
        busy={deleteBusy}
        error={deleteError}
        onCancel={() => setDeleting(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}