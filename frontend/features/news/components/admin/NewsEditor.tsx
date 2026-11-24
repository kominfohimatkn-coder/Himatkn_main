"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { ExternalLink, Eye, RefreshCw, Search, Trash2 } from "lucide-react";

import { Badge } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { Notice } from "@/components/admin/shared/Notice";
import { PageHead } from "@/components/admin/shared/PageHead";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { useToast } from "@/components/admin/shared/Toast";
import { Button, ButtonLink } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { SelectMenu } from "@/components/ui/SelectMenu";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import { ApiError } from "@/lib/api/errors";
import { relativeTime } from "@/lib/relative-time";

import {
  createAdminNews,
  createAdminNewsTag,
  deleteAdminNews,
  getAdminNewsByIdentifier,
  getAdminNewsTags,
  updateAdminNews,
} from "../../admin-api";
import { NEWS_STATUS } from "../../status";
import type { AdminNews, NewsImage, NewsStatus, NewsTag } from "../../types";
import { NewsContentField } from "./NewsContentField";
import { NewsGallery } from "./NewsGallery";

const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const dateTimeFormat = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Datetime backend tanpa zona waktu dianggap UTC (lihat `relativeTime`). */
function formatDateTime(value: string) {
  return dateTimeFormat.format(new Date(/Z|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`));
}

type Errors = Partial<Record<"title" | "slug" | "content", string>>;

/**
 * Editor publikasi, mengikuti `newsEditor()` di Design/admin.
 * `newsId = null` untuk publikasi baru.
 */
export function NewsEditor({ newsId }: { newsId: number | null }) {
  const isNew = newsId === null;
  const router = useRouter();
  const toast = useToast();
  const { admin, can } = useAuth();
  const editable = isNew || can(PERMISSIONS.NEWS_UPDATE);
  const canCreateTag = can(PERMISSIONS.NEWS_CREATE);
  const canDelete = can(PERMISSIONS.NEWS_DELETE);

  const [news, setNews] = useState<AdminNews | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "missing" | "error">(
    isNew ? "ready" : "loading",
  );
  const [loadError, setLoadError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [allTags, setAllTags] = useState<NewsTag[]>([]);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<NewsStatus>("draft");
  const [tagIds, setTagIds] = useState<number[]>([]);
  const [newTag, setNewTag] = useState("");
  const [tagBusy, setTagBusy] = useState(false);

  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState<"save" | "publish" | null>(null);
  const [dirty, setDirty] = useState(false);

  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    getAdminNewsTags()
      .then((result) => setAllTags(result.items))
      .catch(() => setAllTags([]));
  }, []);

  useEffect(() => {
    if (newsId === null) return;
    let active = true;

    getAdminNewsByIdentifier(newsId)
      .then((result) => {
        if (!active) return;
        setNews(result);
        setTitle(result.title);
        setSlug(result.slug);
        setContent(result.content);
        setStatus(result.status);
        setTagIds(result.tags.map((tag) => tag.id));
        setLoadState("ready");
      })
      .catch((err: unknown) => {
        if (!active) return;
        if (err instanceof ApiError && err.status === 404) {
          setLoadState("missing");
        } else {
          setLoadError(err instanceof Error ? err.message : "Publikasi gagal dimuat.");
          setLoadState("error");
        }
      });

    return () => {
      active = false;
    };
  }, [newsId, reloadKey]);

  // Peringatan bawaan peramban saat menutup/memuat ulang tab dengan perubahan belum disimpan.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function change<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
    };
  }

  function onTitleChange(value: string) {
    setTitle(value);
    setDirty(true);
    if (!slugTouched) setSlug(slugify(value));
  }

  function toggleTag(id: number) {
    setTagIds((current) =>
      current.includes(id) ? current.filter((tagId) => tagId !== id) : [...current, id],
    );
    setDirty(true);
  }

  async function addTag() {
    const name = newTag.trim();
    if (!name) return;

    if (allTags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) {
      toast("Tag itu sudah ada.", "error");
      return;
    }

    setTagBusy(true);
    try {
      const tag = await createAdminNewsTag({ name });
      setAllTags((current) => [...current, tag]);
      setTagIds((current) => [...current, tag.id]);
      setNewTag("");
      setDirty(true);
      toast(`Tag “${tag.name}” dibuat.`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Tag gagal dibuat.", "error");
    } finally {
      setTagBusy(false);
    }
  }

  function validate(): Errors {
    const next: Errors = {};
    const cleanTitle = title.trim();
    const cleanSlug = slug.trim();

    if (!cleanTitle) next.title = "Judul wajib diisi.";
    else if (cleanTitle.length < 2) next.title = "Judul minimal 2 karakter.";

    if (!cleanSlug) next.slug = "Alamat halaman wajib diisi.";
    else if (!SLUG_PATTERN.test(cleanSlug))
      next.slug = "Gunakan huruf kecil, angka, dan tanda hubung saja.";

    if (!content.trim()) next.content = "Isi publikasi wajib diisi.";
    return next;
  }

  async function save(act: "save" | "publish") {
    if (!editable || saving) return;

    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      toast("Periksa kembali isian yang ditandai.", "error");
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug.trim(),
      content,
      status: act === "publish" ? ("published" as const) : status,
      tag_ids: tagIds,
    };

    setSaving(act);
    try {
      if (isNew) {
        const created = await createAdminNews(payload);
        setDirty(false);
        toast(
          act === "publish"
            ? "Publikasi diterbitkan."
            : "Draft disimpan. Sekarang Anda bisa menambahkan gambar.",
        );
        router.replace(`/admin/news/${created.id}`);
        return;
      }

      const updated = await updateAdminNews(news!.id, payload);
      setNews(updated);
      setStatus(updated.status);
      setSlug(updated.slug);
      setDirty(false);
      toast(act === "publish" ? "Publikasi diterbitkan." : "Perubahan disimpan.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setErrors({ slug: "Alamat ini sudah dipakai publikasi lain." });
        toast("Alamat halaman sudah dipakai.", "error");
      } else {
        toast(err instanceof Error ? err.message : "Publikasi gagal disimpan.", "error");
      }
    } finally {
      setSaving(null);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    void save(submitter?.value === "publish" ? "publish" : "save");
  }

  async function confirmDelete() {
    if (!news) return;
    setDeleteBusy(true);
    setDeleteError("");
    try {
      await deleteAdminNews(news.id);
      setDirty(false);
      toast("Publikasi dihapus.");
      router.push("/admin/news");
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Publikasi gagal dihapus.");
      setDeleteBusy(false);
    }
  }

  if (loadState === "loading") {
    return (
      <div role="status" aria-label="Memuat publikasi" className="animate-pulse">
        <div className="mb-[26px] grid gap-3">
          <div className="h-[11px] w-[90px] rounded-[3px] bg-green-900/5" />
          <div className="h-7 w-[260px] rounded-[3px] bg-green-900/5" />
        </div>
        <div className="grid items-start gap-5 min-[1101px]:grid-cols-[1fr_320px]">
          <div className="h-[520px] rounded-[4px] bg-green-900/5" />
          <div className="h-[260px] rounded-[4px] bg-green-900/5" />
        </div>
      </div>
    );
  }

  if (loadState === "missing" || loadState === "error") {
    const missing = loadState === "missing";
    return (
      <Card>
        <StateBlock
          tone={missing ? "default" : "error"}
          icon={missing ? <Search /> : <RefreshCw />}
          label={missing ? "Tidak ditemukan" : "Gagal memuat"}
          title={missing ? "Publikasi tidak ditemukan" : "Publikasi tidak dapat dimuat"}
          action={
            missing ? (
              <ButtonLink href="/admin/news" variant="outline">
                Kembali ke daftar
              </ButtonLink>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setLoadState("loading");
                  setReloadKey((key) => key + 1);
                }}
              >
                <RefreshCw aria-hidden="true" /> Coba lagi
              </Button>
            )
          }
        >
          {missing ? "Publikasi ini mungkin sudah dihapus." : loadError}
        </StateBlock>
      </Card>
    );
  }

  const savedStatus = news?.status ?? "draft";
  const savedInfo = NEWS_STATUS[savedStatus];
  const saveText = isNew
    ? "Belum disimpan"
    : dirty
      ? "Ada perubahan belum disimpan"
      : `Tersimpan · ${relativeTime(news?.updated_at ?? null)}`;
  const authorName = news && admin && news.author_id === admin.id ? admin.username : null;

  return (
    <>
      <PageHead
        label="Publikasi"
        title={isNew ? "Tulis publikasi" : editable ? "Edit publikasi" : "Lihat publikasi"}
        actions={
          <>
            {editable ? (
              <div role="status" className="flex items-center gap-2.5 self-center text-xs text-muted">
                <span
                  aria-hidden="true"
                  className={`size-[7px] rounded-full ${!isNew && !dirty ? "bg-green-700" : "bg-amber"}`}
                />
                {saveText}
              </div>
            ) : null}
            {news?.status === "published" ? (
              <a
                href={`/publikasi/${news.slug}`}
                target="_blank"
                rel="noopener"
                className="inline-flex h-[38px] items-center gap-2 rounded-[4px] border border-line-strong bg-white px-4 text-[11.5px] leading-none font-semibold tracking-[0.08em] text-green-900 uppercase no-underline hover:border-green-800 [&_svg]:size-[15px]"
              >
                <ExternalLink aria-hidden="true" /> Lihat di situs
              </a>
            ) : null}
            <Button
              variant="outline"
              onClick={() => (dirty ? setLeaveOpen(true) : router.push("/admin/news"))}
            >
              Kembali
            </Button>
          </>
        }
      />

      {!editable ? (
        <Notice icon={<Eye aria-hidden="true" />} className="mb-4">
          <strong>Mode lihat saja.</strong> Akun Anda dapat melihat publikasi ini
          tetapi tidak dapat mengubahnya (butuh izin “Ubah publikasi”).
        </Notice>
      ) : null}

      <form
        ref={formRef}
        noValidate
        onSubmit={onSubmit}
        className="grid grid-cols-1 items-start gap-5 min-[1101px]:grid-cols-[minmax(0,1fr)_320px]"
      >
        <Card className="min-w-0">
          <div className="grid gap-1.5">
            <label htmlFor="news-title" className="sr-only">
              Judul
            </label>
            <input
              id="news-title"
              name="title"
              value={title}
              readOnly={!editable}
              maxLength={255}
              placeholder="Judul publikasi"
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={errors.title ? "news-title-error" : undefined}
              onChange={(event) => onTitleChange(event.target.value)}
              className="w-full border-0 border-b border-line bg-transparent px-0 pt-1 pb-3.5 font-serif text-[28px] leading-[1.3] font-bold text-green-900 outline-none placeholder:text-[#b6c2bc] focus-visible:border-green-800 aria-invalid:border-danger max-[640px]:text-2xl"
            />
            {errors.title ? (
              <p id="news-title-error" role="alert" className="text-xs text-danger">
                {errors.title}
              </p>
            ) : null}
          </div>

          <FormField
            className="mt-4"
            label="Alamat halaman"
            required
            hint="Terisi otomatis dari judul. Hanya huruf kecil, angka, dan tanda hubung; harus unik."
            error={errors.slug}
          >
            <SlugInput
              value={slug}
              readOnly={!editable}
              onChange={(value) => {
                setSlugTouched(true);
                change(setSlug)(value);
              }}
            />
          </FormField>

          <NewsContentField
            value={content}
            onChange={change(setContent)}
            readOnly={!editable}
            error={errors.content}
          />
        </Card>

        <div className="grid min-w-0 grid-cols-1 gap-4 min-[1101px]:sticky min-[1101px]:top-[84px]">
          <Card
            title="Status"
            action={isNew ? undefined : <Badge tone={savedInfo.tone}>{savedInfo.label}</Badge>}
          >
            <FormField label="Status">
              <SelectMenu<NewsStatus>
                size="md"
                label="Status"
                hideLabel
                value={status}
                disabled={!editable}
                onChange={change(setStatus)}
                options={[
                  { value: "draft", label: "Draft", description: "Tidak tampil di situs" },
                  { value: "published", label: "Terbit", description: "Tampil di situs" },
                  { value: "archived", label: "Arsip", description: "Disembunyikan dari situs" },
                ]}
              />
            </FormField>
            <p className="mt-2.5 text-xs text-muted">
              {news?.published_at
                ? `Terbit ${formatDateTime(news.published_at)}`
                : "Tanggal terbit diisi otomatis saat status diubah ke Terbit."}
              {authorName ? (
                <>
                  <br />
                  Penulis: {authorName}
                </>
              ) : null}
            </p>
            {editable ? (
              <div className="mt-4 grid gap-2">
                <Button type="submit" value="save" disabled={saving !== null}>
                  {saving === "save" ? "Menyimpan..." : isNew ? "Simpan draft" : "Simpan perubahan"}
                </Button>
                {savedStatus !== "published" ? (
                  <Button type="submit" value="publish" variant="outline" disabled={saving !== null}>
                    {saving === "publish" ? "Menerbitkan..." : "Simpan & terbitkan"}
                  </Button>
                ) : null}
              </div>
            ) : null}
          </Card>

          <Card title="Tag">
            <div className="flex flex-wrap gap-1.5">
              {allTags.length === 0 ? (
                <p className="text-[13px] text-muted">Belum ada tag.</p>
              ) : null}
              {allTags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  aria-pressed={tagIds.includes(tag.id)}
                  disabled={!editable}
                  onClick={() => toggleTag(tag.id)}
                  className="inline-flex h-7 cursor-pointer items-center rounded-[14px] border border-line bg-white px-2.5 text-[12.5px] transition-colors hover:border-green-800 disabled:cursor-default disabled:hover:border-line aria-pressed:border-green-800 aria-pressed:bg-green-800 aria-pressed:text-white"
                >
                  {tag.name}
                </button>
              ))}
            </div>
            {editable && canCreateTag ? (
              <div className="mt-3 flex">
                <label htmlFor="news-new-tag" className="sr-only">
                  Tag baru
                </label>
                <input
                  id="news-new-tag"
                  value={newTag}
                  maxLength={100}
                  placeholder="Tag baru…"
                  onChange={(event) => setNewTag(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void addTag();
                    }
                  }}
                  className="min-w-0 flex-1 rounded-l-[4px] border border-line bg-white px-3 py-2 text-sm text-ink outline-none placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)]"
                />
                <Button
                  variant="outline"
                  className="h-auto! rounded-l-none border-l-0"
                  disabled={tagBusy || newTag.trim().length < 2}
                  onClick={() => void addTag()}
                >
                  Tambah
                </Button>
              </div>
            ) : null}
          </Card>

          <NewsGallery
            newsId={news?.id ?? null}
            images={news?.images ?? []}
            editable={editable}
            onImagesChange={(images: NewsImage[]) =>
              setNews((current) => (current ? { ...current, images } : current))
            }
            onSaveFirst={() => void save("save")}
          />

          {!isNew && canDelete ? (
            <Card>
              <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-danger uppercase">
                Zona berbahaya
              </p>
              <p className="mt-1.5 mb-3 text-[13px] text-muted">
                Menghapus publikasi juga menghapus semua gambarnya.
              </p>
              <Button
                variant="danger-outline"
                onClick={() => {
                  setDeleteError("");
                  setDeleteOpen(true);
                }}
              >
                <Trash2 aria-hidden="true" /> Hapus publikasi
              </Button>
            </Card>
          ) : null}
        </div>
      </form>

      <ConfirmDialog
        open={leaveOpen}
        tone="default"
        title="Tinggalkan halaman ini?"
        description="Ada perubahan yang belum disimpan. Jika Anda pindah halaman, perubahan itu akan hilang."
        confirmLabel="Tinggalkan"
        onCancel={() => setLeaveOpen(false)}
        onConfirm={() => {
          setDirty(false);
          setLeaveOpen(false);
          router.push("/admin/news");
        }}
      />

      <ConfirmDialog
        open={deleteOpen}
        title="Hapus publikasi?"
        description={`“${news?.title ?? ""}” dan semua gambarnya akan dihapus permanen.`}
        confirmLabel="Hapus"
        busyLabel="Menghapus..."
        busy={deleteBusy}
        error={deleteError}
        onCancel={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

/** Input slug dengan awalan `/publikasi/` (`.input-group` + `.prefix`). */
function SlugInput({
  value,
  readOnly,
  onChange,
  ...aria
}: {
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false" | "grammar" | "spelling";
}) {
  return (
    <div className="flex">
      <span className="grid place-items-center rounded-l-[4px] border border-r-0 border-line bg-mint-50 px-2.5 text-xs whitespace-nowrap text-muted">
        /publikasi/
      </span>
      <input
        {...aria}
        name="slug"
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full min-w-0 rounded-r-[4px] border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] read-only:bg-mint-50 read-only:text-muted aria-invalid:border-danger"
      />
    </div>
  );
}