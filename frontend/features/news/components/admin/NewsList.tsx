"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import {
  ExternalLink,
  Eye,
  FileText,
  ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";

import { Badge } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { Pager, Table, Td, Th, Tr } from "@/components/admin/shared/DataTable";
import {
  SearchInput,
  Segmented,
  SelectSm,
  Toolbar,
} from "@/components/admin/shared/ListControls";
import { Notice } from "@/components/admin/shared/Notice";
import { PageHead } from "@/components/admin/shared/PageHead";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { useToast } from "@/components/admin/shared/Toast";
import { Button, ButtonLink } from "@/components/ui/Button";
import { getAdminAccounts } from "@/features/accounts/api";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import { resolveMediaUrl } from "@/lib/media/api";

import {
  deleteAdminNews,
  getAdminNews,
  getAdminNewsTags,
} from "../../admin-api";
import { formatNewsDateShort } from "../../format";
import { NEWS_STATUS } from "../../status";
import type { AdminNews, NewsStatus, NewsTag } from "../../types";

const PER_PAGE = 10;
const FETCH_LIMIT = 100;
const MAX_FETCH_PAGES = 10;

type StatusFilter = "all" | NewsStatus;

/**
 * Backend belum menyediakan total, pencarian, dan filter tag, jadi semua
 * publikasi (maks. 1.000) dimuat sekali lalu disaring di browser.
 */
async function loadAllNews(signal: AbortSignal): Promise<AdminNews[]> {
  const all: AdminNews[] = [];

  for (let page = 0; page < MAX_FETCH_PAGES; page++) {
    const result = await getAdminNews(
      { offset: page * FETCH_LIMIT, limit: FETCH_LIMIT },
      { signal },
    );
    all.push(...result.items);
    if (result.items.length < FETCH_LIMIT) break;
  }

  return all.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
}

/** Halaman daftar publikasi, mengikuti `viewNews()` di Design/admin. */
export default function NewsList() {
  const { admin, can } = useAuth();
  const toast = useToast();
  const canCreate = can(PERMISSIONS.NEWS_CREATE);
  const canUpdate = can(PERMISSIONS.NEWS_UPDATE);
  const canDelete = can(PERMISSIONS.NEWS_DELETE);
  const canViewAdmins = can(PERMISSIONS.ADMINS_VIEW);

  const [items, setItems] = useState<AdminNews[] | null>(null);
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [authors, setAuthors] = useState<Map<number, string>>(new Map());
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [tagId, setTagId] = useState("");
  const [page, setPage] = useState(1);

  const [deleting, setDeleting] = useState<AdminNews | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      loadAllNews(controller.signal),
      getAdminNewsTags().catch(() => ({ items: [] })),
      canViewAdmins
        ? getAdminAccounts({ signal: controller.signal }).catch(() => null)
        : Promise.resolve(null),
    ])
      .then(([news, tagResult, accounts]) => {
        const names = new Map<number, string>();
        accounts?.items.forEach((account) => names.set(account.id, account.username));
        if (admin) names.set(admin.id, admin.username);

        setItems(news);
        setTags(tagResult.items);
        setAuthors(names);
        setError("");
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Daftar publikasi gagal dimuat.");
      });

    return () => controller.abort();
  }, [admin, canViewAdmins, reloadKey]);

  const counts = useMemo(() => {
    const result = { all: 0, published: 0, draft: 0, archived: 0 };
    items?.forEach((item) => {
      result.all++;
      result[item.status]++;
    });
    return result;
  }, [items]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (item) =>
        (status === "all" || item.status === status) &&
        (!tagId || item.tags.some((tag) => String(tag.id) === tagId)) &&
        (!q || item.title.toLowerCase().includes(q)),
    );
  }, [items, query, status, tagId]);

  const pageRows = rows.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function resetFilters() {
    setQuery("");
    setStatus("all");
    setTagId("");
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleting) return;
    setDeleteBusy(true);
    setDeleteError("");

    try {
      await deleteAdminNews(deleting.id);
      setItems((current) => current?.filter((item) => item.id !== deleting.id) ?? null);
      setDeleting(null);
      toast("Publikasi dihapus.");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Publikasi gagal dihapus.");
    } finally {
      setDeleteBusy(false);
    }
  }

  let body;

  if (error) {
    body = (
      <StateBlock
        tone="error"
        icon={<RefreshCw />}
        label="Gagal memuat"
        title="Publikasi tidak dapat dimuat"
        action={
          <Button
            variant="outline"
            onClick={() => {
              setError("");
              setItems(null);
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
  } else if (items === null) {
    body = (
      <div role="status" aria-label="Memuat publikasi" className="grid gap-4 p-4">
        {[0, 1, 2, 3, 4].map((row) => (
          <div key={row} className="flex animate-pulse items-center gap-3">
            <div className="aspect-[3/2] w-16 rounded-[3px] bg-green-900/5" />
            <div className="grid flex-1 gap-2">
              <div className="h-3 w-3/5 rounded-[3px] bg-green-900/5" />
              <div className="h-2.5 w-1/4 rounded-[3px] bg-green-900/5" />
            </div>
          </div>
        ))}
      </div>
    );
  } else if (items.length === 0) {
    body = (
      <StateBlock
        icon={<FileText />}
        label="Publikasi"
        title="Belum ada publikasi"
        action={
          canCreate ? <ButtonLink href="/admin/news/new">Tulis publikasi</ButtonLink> : undefined
        }
      >
        Mulai dengan menulis kabar atau dokumentasi kegiatan pertama.
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
              <Th>Judul</Th>
              <Th>Status</Th>
              <Th>Tag</Th>
              <Th>Penulis</Th>
              <Th>Diperbarui</Th>
              <Th>
                <span className="sr-only">Aksi</span>
              </Th>
            </>
          }
        >
          {pageRows.map((item) => {
            const cover = resolveMediaUrl(item.images[0]?.url);
            const statusInfo = NEWS_STATUS[item.status];

            return (
              <Tr key={item.id}>
                <Td>
                  <div className="flex items-center gap-3">
                    <div className="grid aspect-[3/2] w-16 shrink-0 place-items-center overflow-hidden rounded-[3px] bg-[#dce5e0] text-muted-light [&_svg]:size-[18px]">
                      {cover ? (
                        <img src={cover} alt="" className="size-full object-cover grayscale" />
                      ) : (
                        <ImageIcon aria-hidden="true" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-green-900">{item.title}</div>
                      <div className="mt-0.5 text-xs text-muted">
                        {item.images.length ? `${item.images.length} gambar` : "Belum ada gambar"}
                      </div>
                    </div>
                  </div>
                </Td>
                <Td label="Status">
                  <Badge tone={statusInfo.tone}>{statusInfo.label}</Badge>
                </Td>
                <Td label="Tag">
                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map((tag) => (
                      <Badge key={tag.id} tone="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </Td>
                <Td label="Penulis">
                  {(item.author_id !== null && authors.get(item.author_id)) || "—"}
                </Td>
                <Td label="Diperbarui" className="text-xs">
                  {formatNewsDateShort(item.updated_at) ?? "—"}
                </Td>
                <Td actions>
                  <div className="inline-flex gap-1">
                    {item.status === "published" ? (
                      <a
                        href={`/publikasi/${item.slug}`}
                        target="_blank"
                        rel="noopener"
                        title="Lihat di situs"
                        aria-label={`Lihat “${item.title}” di situs`}
                        className="inline-flex size-[34px] items-center justify-center rounded-[4px] text-muted hover:bg-mint-50 hover:text-green-900 [&_svg]:size-[15px]"
                      >
                        <ExternalLink aria-hidden="true" />
                      </a>
                    ) : null}
                    <ButtonLink href={`/admin/news/${item.id}`} variant="outline" size="sm">
                      {canUpdate ? (
                        <>
                          <Pencil aria-hidden="true" /> Edit
                        </>
                      ) : (
                        <>
                          <Eye aria-hidden="true" /> Lihat
                        </>
                      )}
                    </ButtonLink>
                    {canDelete ? (
                      <Button
                        variant="danger-outline"
                        size="icon"
                        className="size-8!"
                        aria-label={`Hapus “${item.title}”`}
                        onClick={() => {
                          setDeleteError("");
                          setDeleting(item);
                        }}
                      >
                        <Trash2 aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
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
        title="Publikasi"
        description="Berita dan dokumentasi kegiatan. Hanya publikasi berstatus Terbit yang tampil di situs."
        actions={
          canCreate ? (
            <ButtonLink href="/admin/news/new">
              <Plus aria-hidden="true" /> Tulis publikasi
            </ButtonLink>
          ) : undefined
        }
      />

      {!canUpdate ? (
        <Notice icon={<Eye aria-hidden="true" />} className="mb-4">
          <strong>Mode lihat saja.</strong> Akun Anda dapat melihat publikasi
          tetapi tidak dapat mengubahnya (butuh izin “Ubah publikasi”).
        </Notice>
      ) : null}

      <Card bodyClassName="p-0">
        <Toolbar>
          <SearchInput
            placeholder="Cari judul…"
            aria-label="Cari publikasi"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
          <Segmented<StatusFilter>
            label="Status"
            value={status}
            onChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
            options={[
              { value: "all", label: "Semua", count: counts.all },
              { value: "published", label: "Terbit", count: counts.published },
              { value: "draft", label: "Draft", count: counts.draft },
              { value: "archived", label: "Arsip", count: counts.archived },
            ]}
          />
          <SelectSm
            aria-label="Tag"
            value={tagId}
            onChange={(event) => {
              setTagId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Semua tag</option>
            {tags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </SelectSm>
        </Toolbar>
        {body}
      </Card>

      <ConfirmDialog
        open={deleting !== null}
        title="Hapus publikasi?"
        description={`“${deleting?.title ?? ""}” beserta semua gambarnya akan dihapus permanen dan tidak bisa dikembalikan.`}
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