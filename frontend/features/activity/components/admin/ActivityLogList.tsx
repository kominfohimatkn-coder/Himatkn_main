"use client";

import { useEffect, useState } from "react";
import { ChevronRight, History, RefreshCw, Search } from "lucide-react";

import { Avatar } from "@/components/admin/shared/Avatar";
import { Badge } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import { Pager, Table, Td, Th, Tr } from "@/components/admin/shared/DataTable";
import {
  SearchInput,
  Segmented,
  SelectSm,
  Toolbar,
} from "@/components/admin/shared/ListControls";
import { PageHead } from "@/components/admin/shared/PageHead";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/api/errors";

import { getActivityAdmins, getActivityLogs } from "../../api";
import {
  activityActor,
  activityBadge,
  activityText,
  activityTime,
  activityTimeShort,
  describeDevice,
  KIND_LABELS,
} from "../../format";

import type {
  ActivityAdminOption,
  ActivityKind,
  ActivityLog,
  ActivityLogListResponse,
} from "../../types";

const PER_PAGE = 20;
const KINDS = Object.keys(KIND_LABELS) as ActivityKind[];

type KindFilter = ActivityKind | "all";

function ActivityBadge({ log }: { log: ActivityLog }) {
  const { label, tone } = activityBadge(log);
  return <Badge tone={tone}>{label}</Badge>;
}

function deviceLine(log: ActivityLog) {
  return `Alamat IP ${log.ip_address ?? "tidak tercatat"} · ${describeDevice(log.user_agent)}`;
}

/**
 * Halaman Log Aktivitas, mengikuti `viewActivity()` di Design/admin dan
 * `mViewActivity()` di Design/admin/mobile.html. Cari, filter, dan nomor
 * halaman dijalankan di backend karena catatan terus bertambah.
 */
export default function ActivityLogList() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [adminId, setAdminId] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [data, setData] = useState<ActivityLogListResponse | null>(null);
  /** Permintaan yang hasilnya sedang tampil; berbeda = sedang memuat. */
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState("");
  const [admins, setAdmins] = useState<ActivityAdminOption[]>([]);

  // Kata kunci dikirim setelah berhenti mengetik sebentar.
  useEffect(() => {
    const timer = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    getActivityAdmins({ signal: controller.signal })
      .then((result) => setAdmins(result.items))
      .catch(() => {
        // Filter admin hanya pelengkap; daftar tetap bisa dipakai tanpanya.
      });
    return () => controller.abort();
  }, []);

  const requestKey = JSON.stringify([search, kind, adminId, page, reloadKey]);
  const loading = loadedKey !== requestKey;

  useEffect(() => {
    const controller = new AbortController();

    getActivityLogs(
      {
        q: search,
        kind: kind === "all" ? undefined : kind,
        adminId: adminId ? Number(adminId) : undefined,
        offset: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      },
      { signal: controller.signal },
    )
      .then((result) => {
        setData(result);
        setError("");
        setLoadedKey(requestKey);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(getApiErrorMessage(err, "Log aktivitas gagal dimuat."));
        setLoadedKey(requestKey);
      });

    return () => controller.abort();
  }, [search, kind, adminId, page, requestKey]);

  const filtered = Boolean(search || adminId || kind !== "all");

  function resetFilters() {
    setQuery("");
    setSearch("");
    setKind("all");
    setAdminId("");
    setPage(1);
  }

  let body;
  if (error) {
    body = (
      <StateBlock
        tone="error"
        icon={<RefreshCw />}
        label="Gagal memuat"
        title="Log aktivitas tidak dapat dimuat"
        action={
          <Button variant="outline" onClick={() => setReloadKey((key) => key + 1)}>
            <RefreshCw aria-hidden="true" /> Coba lagi
          </Button>
        }
      >
        {error}
      </StateBlock>
    );
  } else if (data === null) {
    body = (
      <div role="status" aria-label="Memuat log aktivitas" className="grid gap-4 p-4">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex animate-pulse items-center gap-3">
            <div className="size-[34px] rounded-full bg-green-900/5" />
            <div className="grid flex-1 gap-2">
              <div className="h-3 w-3/5 rounded-[3px] bg-green-900/5" />
              <div className="h-2.5 w-1/4 rounded-[3px] bg-green-900/5" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (data.total === 0 && !filtered) {
    body = (
      <StateBlock icon={<History />} label="Log" title="Belum ada aktivitas tercatat">
        Setiap perubahan data dan login administrator akan tercatat otomatis.
      </StateBlock>
    );
  } else if (data.items.length === 0) {
    body = (
      <StateBlock
        icon={<Search />}
        label="Pencarian"
        title={`Tidak ada hasil untuk “${search || "filter ini"}”`}
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
      <div
        aria-busy={loading}
        className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}
      >
        <Table
          className="max-[640px]:hidden"
          head={
            <>
              <Th>Waktu</Th>
              <Th>Administrator</Th>
              <Th>Aksi</Th>
              <Th>Keterangan</Th>
            </>
          }
        >
          {data.items.map((log) => {
            const time = activityTime(log.created_at);
            const actor = activityActor(log);

            return (
              <Tr key={log.id}>
                <Td className="align-top text-xs whitespace-nowrap">
                  <time dateTime={`${log.created_at}Z`} title={time.full}>
                    <span className="block text-ink">{time.date}</span>
                    <span className="text-muted">{time.time}</span>
                  </time>
                </Td>
                <Td className="align-top">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={log.admin_username ?? "?"} off={!log.admin_username} />
                    <span
                      className={
                        log.admin_username ? "font-semibold text-green-900" : "text-muted italic"
                      }
                    >
                      {actor}
                    </span>
                  </div>
                </Td>
                <Td className="align-top">
                  <ActivityBadge log={log} />
                </Td>
                <Td className="align-top">
                  <span className="wrap-anywhere">{activityText(log)}</span>
                  <details className="group mt-1">
                    <summary className="w-fit cursor-pointer list-none text-xs text-green-800 hover:underline [&::-webkit-details-marker]:hidden">
                      Detail
                    </summary>
                    <p className="mt-1 text-xs text-muted">{deviceLine(log)}</p>
                  </details>
                </Td>
              </Tr>
            );
          })}
        </Table>

        <ul className="divide-y divide-line min-[641px]:hidden">
          {data.items.map((log) => (
            <li key={log.id}>
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-3 py-3 pr-3 pl-4 transition-colors hover:bg-[#f7faf8] active:bg-[#f7faf8] [&::-webkit-details-marker]:hidden">
                  <Avatar name={log.admin_username ?? "?"} off={!log.admin_username} />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-[14px] leading-[1.4] text-ink wrap-anywhere">
                      {activityText(log)}
                    </span>
                    <span className="mt-[5px] flex min-w-0 items-center gap-2">
                      <ActivityBadge log={log} />
                      <span className="min-w-0 flex-1 truncate text-xs text-muted">
                        {activityTimeShort(log.created_at)} · {activityActor(log)}
                      </span>
                    </span>
                  </span>
                  <ChevronRight
                    aria-hidden="true"
                    className="size-4 shrink-0 text-muted-light transition-transform group-open:rotate-90"
                  />
                </summary>
                <p className="pr-4 pb-3 pl-[62px] text-xs text-muted">{deviceLine(log)}</p>
              </details>
            </li>
          ))}
        </ul>

        <Pager total={data.total} page={page} perPage={PER_PAGE} onPage={setPage} />
      </div>
    );
  }

  const counts = data?.counts;

  return (
    <>
      <PageHead
        label="Sistem"
        title="Log Aktivitas"
        description="Catatan perubahan data dan login administrator. Tidak dapat diubah atau dihapus."
      />

      <Card bodyClassName="p-0">
        <Toolbar>
          <SearchInput
            placeholder="Cari keterangan…"
            aria-label="Cari log"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <SelectSm
            aria-label="Administrator"
            value={adminId}
            onChange={(event) => {
              setAdminId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua admin</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.username}
              </option>
            ))}
          </SelectSm>
          <Segmented<KindFilter>
            label="Jenis aksi"
            value={kind}
            onChange={(value) => {
              setKind(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "Semua", count: counts?.all },
              ...KINDS.map((value) => ({
                value,
                label: KIND_LABELS[value],
                count: counts?.[value],
              })),
            ]}
          />
        </Toolbar>
        {body}
      </Card>
    </>
  );
}