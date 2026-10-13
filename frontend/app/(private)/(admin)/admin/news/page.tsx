"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { useAuth } from "@/context/AuthContext";
import {
  createAdminNews,
  createAdminNewsTag,
  deleteAdminNews,
  getAdminNews,
  getAdminNewsByIdentifier,
  getAdminNewsTags,
  updateAdminNews,
  uploadAdminNewsImage,
} from "@/lib/api/admin/news";

import type {
  AdminNews,
  NewsListResponse,
  NewsStatus,
  NewsTag,
} from "@/types/news";

import {
  NewsTags,
  Spinner,
  StatusBadge,
} from "@/components/admin/news/NewsPrimitives";

const PAGE_SIZE = 20;
const REQUEST_SIZE = PAGE_SIZE + 1;

type StatusFilter = "all" | NewsStatus;

type NewsForm = {
  title: string;
  slug: string;
  content: string;
  status: NewsStatus;
  tagIds: number[];
};

type Feedback = {
  kind: "success" | "error";
  message: string;
};

type DialogProps = {
  open: boolean;
  titleId: string;
  busy?: boolean;
  compact?: boolean;
  onClose: () => void;
  children: ReactNode;
};


const styles = {
  input:
    "min-h-12 w-full min-w-0 border border-paper-line bg-bg-light px-3 py-2.5 text-sm text-ink outline-none placeholder:text-ink-soft/75 focus:border-gold focus:ring-2 focus:ring-gold/20 disabled:cursor-not-allowed disabled:bg-bg-light-2 disabled:text-ink-soft",
  primary:
    "inline-flex min-h-12 items-center justify-center gap-2 border border-gold bg-gold px-4 py-2 text-sm font-semibold text-bg-dark transition-colors hover:bg-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  secondary:
    "inline-flex min-h-12 items-center justify-center gap-2 border border-paper-line bg-bg-light px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-gold/70 hover:bg-bg-light-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "inline-flex min-h-11 items-center justify-center gap-2 border border-red-300 bg-bg-light px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  dangerSolid:
    "inline-flex min-h-11 items-center justify-center px-3 py-2 text-sm font-medium bg-red-700 text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 disabled:cursor-not-allowed disabled:opacity-50",
  text:
    "inline-flex min-h-11 items-center justify-center px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-bg-light-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-not-allowed disabled:opacity-50",
  label: "mb-1.5 block text-sm font-medium text-ink",
  help: "mt-2 text-xs leading-5 text-ink-soft/90",
  alert:
    "mb-5 border-l-2 border-red-500 bg-red-50 px-3 py-3 text-sm leading-6 text-red-800",
  dialogBase: "bg-bg-light p-0 text-ink shadow-2xl backdrop:bg-bg-dark/50",
};

// ## DEFAULT FORM: menyediakan nilai awal untuk operasi create dan reset.
function makeEmptyForm(): NewsForm {
  return { title: "", slug: "", content: "", status: "draft", tagIds: [] };
}

// ## ERROR MESSAGE: ubah unknown error menjadi teks yang aman untuk UI.
function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

// ## FORMAT DATE: tampilkan tanggal API dengan format Indonesia.
function formatDate(value: string | null | undefined): string {
  if (!value) return "Tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tidak tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

// ## FORMAT FILE SIZE: ubah ukuran file menjadi B, KB, atau MB.
function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

// ## SKELETON WRAPPER: menyatukan semantik aksesibilitas dan animasi skeleton.
type SkeletonWrapperProps = {
  label: string;
  className?: string;
  children: ReactNode;
};

function SkeletonWrapper({
  label,
  className = "",
  children,
}: SkeletonWrapperProps) {
  return (
    <div role="status" aria-label={label} className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

// ## SKELETON LIST: placeholder responsif agar perubahan state loading tidak meloncat.
function NewsListSkeleton() {
  const rows = [0, 1, 2, 3, 4];

  return (
    <SkeletonWrapper
      label="Memuat daftar berita"
      className="animate-pulse motion-reduce:animate-none"
    >
      <ul className="divide-y divide-paper-line lg:hidden">
        {rows.map((row) => (
          <li key={row} className="space-y-3 px-4 py-4 sm:px-5">
            <div className="flex items-center justify-between gap-3">
              <div className="h-6 w-20 bg-bg-light-2" />
              <div className="h-3 w-12 bg-bg-light-2" />
            </div>
            <div className="h-4 w-4/5 bg-bg-light-2" />
            <div className="h-3 w-3/5 bg-bg-light-2" />
            <div className="flex items-center justify-between border-t border-paper-line/70 pt-3">
              <div className="h-3 w-28 bg-bg-light-2" />
              <div className="h-8 w-24 bg-bg-light-2" />
            </div>
          </li>
        ))}
      </ul>
      <div className="hidden lg:block">
        <div className="grid grid-cols-[40%_12%_18%_16%_14%] border-b border-paper-line bg-bg-light-2 px-5 py-3">
          {[0, 1, 2, 3, 4].map((column) => (
            <div key={column} className="h-3 w-16 bg-paper-line" />
          ))}
        </div>
        {rows.map((row) => (
          <div
            key={row}
            className="grid grid-cols-[40%_12%_18%_16%_14%] items-center gap-0 border-b border-paper-line/70 px-5 py-5 last:border-b-0"
          >
            <div className="space-y-2 pr-5">
              <div className="h-4 w-3/4 bg-bg-light-2" />
              <div className="h-3 w-1/2 bg-bg-light-2" />
            </div>
            <div className="h-6 w-16 bg-bg-light-2" />
            <div className="h-3 w-20 bg-bg-light-2" />
            <div className="h-3 w-24 bg-bg-light-2" />
            <div className="ml-auto h-8 w-20 bg-bg-light-2" />
          </div>
        ))}
      </div>
    </SkeletonWrapper>
  );
}

// ## SKELETON DETAIL: mengikuti hierarki field ketika detail edit sedang dimuat.
function NewsDetailSkeleton() {
  return (
    <SkeletonWrapper
      label="Memuat detail berita"
      className="space-y-7 animate-pulse motion-reduce:animate-none"
    >
      <section className="space-y-4">
        <div className="h-4 w-28 bg-bg-light-2" />
        <div className="space-y-2">
          <div className="h-3 w-14 bg-bg-light-2" />
          <div className="h-11 w-full bg-bg-light-2" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-12 bg-bg-light-2" />
          <div className="h-11 w-full bg-bg-light-2" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-20 bg-bg-light-2" />
          <div className="h-40 w-full bg-bg-light-2" />
        </div>
      </section>
      <section className="space-y-3 border-t border-paper-line pt-6">
        <div className="h-4 w-36 bg-bg-light-2" />
        <div className="h-11 w-44 bg-bg-light-2" />
        <div className="h-3 w-2/3 bg-bg-light-2" />
      </section>
    </SkeletonWrapper>
  );
}

// ## DIALOG: native modal responsif dengan pengelolaan fokus dan scroll.
function Dialog({
  open,
  titleId,
  busy = false,
  compact = false,
  onClose,
  children,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !busy) onClose();
      }}
      className={`${styles.dialogBase} ${
        compact
          ? "m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-md overflow-y-auto border border-paper-line"
          : "m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 sm:m-auto sm:h-auto sm:max-h-[90dvh] sm:w-[calc(100%-3rem)] sm:max-w-3xl sm:border sm:border-paper-line"
      }`}
    >
      {open ? children : null}
    </dialog>
  );
}

// ## NEWS ADMIN PAGE: daftar, filter, pagination, create, edit, delete, tag, dan upload.
export default function NewsPage() {
  const { admin } = useAuth();

  const canView = admin?.permissions.includes("news.view") ?? false;
  const canCreate = admin?.permissions.includes("news.create") ?? false;
  const canUpdate = admin?.permissions.includes("news.update") ?? false;
  const canDelete = admin?.permissions.includes("news.delete") ?? false;

  // ## State daftar berita dan pagination
  const [response, setResponse] =
    useState<NewsListResponse<AdminNews> | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [offset, setOffset] = useState(0);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  // ## State form tambah/edit
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const [form, setForm] = useState<NewsForm>(makeEmptyForm);
  const [formError, setFormError] = useState("");
  const [detailError, setDetailError] = useState("");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ## State tag berita
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [tagError, setTagError] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [tagCreatorOpen, setTagCreatorOpen] = useState(false);

  // ## State upload gambar baru
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imageCaption, setImageCaption] = useState("");
  const [uploadedImageCount, setUploadedImageCount] = useState(0);

  // ## State konfirmasi hapus
  const [deleteTarget, setDeleteTarget] = useState<AdminNews | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formSessionRef = useRef(0);
  const tagRequestRef = useRef(0);
  const detailRequestRef = useRef(0);
  const submitLockRef = useRef(false);
  const tagLockRef = useRef(false);
  const deleteLockRef = useRef(false);

  // ## INVALIDATE REQUESTS: batalkan semua respons tag/detail dari sesi form sebelumnya.
  const invalidateRequests = useCallback(() => {
    formSessionRef.current += 1;
    tagRequestRef.current += 1;
    detailRequestRef.current += 1;
  }, []);

  const isEditing = editingId !== null;
  const formBusy = isSaving || isCreatingTag || isLoadingDetail;
  // Setelah create berhasil, field dikunci supaya retry hanya melanjutkan upload.
  const fieldsLocked = formBusy || createdId !== null;
  const currentOffset = response?.offset ?? offset;
  const currentPage = Math.floor(currentOffset / PAGE_SIZE) + 1;
  const canPrevious = currentOffset > 0;
  const items = response?.items ?? [];

  // ## GET daftar berita. Mengambil satu item tambahan untuk menentukan next page.
  // AbortController membatalkan request lama saat filter/halaman berubah atau komponen dilepas.
  useEffect(() => {
    if (!canView) return;

    const controller = new AbortController();

    async function fetchNews() {
      try {
        const result = await getAdminNews(
          {
            offset,
            limit: REQUEST_SIZE,
            ...(statusFilter !== "all" ? { status: statusFilter } : {}),
          },
          { signal: controller.signal },
        );

        if (controller.signal.aborted) return;
        setHasNextPage(result.items.length > PAGE_SIZE);
        setResponse({
          ...result,
          items: result.items.slice(0, PAGE_SIZE),
          limit: PAGE_SIZE,
        });
        setListError("");
      } catch (error) {
        if (controller.signal.aborted) return;
        setListError(errorMessage(error, "Daftar berita gagal dimuat."));
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void fetchNews();
    return () => {
      controller.abort();
    };
  }, [canView, offset, statusFilter, refreshKey]);

  // ## Invalidasi request saat komponen dilepas agar respons lama tidak mengubah sesi baru.
  useEffect(() => {
    return () => {
      invalidateRequests();
    };
  }, [invalidateRequests]);

  // ## Refresh daftar berita setelah create/update/delete.
  const reloadNews = useCallback(() => {
    setListError("");
    setIsLoading(true);
    setRefreshKey((value) => value + 1);
  }, []);

  // ## Navigasi pagination.
  function changePage(nextOffset: number) {
    setIsLoading(true);
    setOffset(Math.max(0, nextOffset));
  }

  // ## Filter status dan kembali ke halaman pertama.
  function changeStatus(nextStatus: StatusFilter) {
    setIsLoading(true);
    setOffset(0);
    setStatusFilter(nextStatus);
  }

  // ## Update satu field form dengan tipe yang sesuai.
  function updateForm<K extends keyof NewsForm>(key: K, value: NewsForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  // ## Reset state form ketika memulai sesi tambah/edit baru.
  function resetForm() {
    setForm(makeEmptyForm());
    setEditingId(null);
    setCreatedId(null);
    setFormError("");
    setDetailError("");
    setIsLoadingDetail(false);
    setIsLoadingTags(false);
    setTagError("");
    setNewTagName("");
    setTagCreatorOpen(false);
    setImageFiles([]);
    setImageCaption("");
    setUploadedImageCount(0);
    setTags([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ## Tutup form. Jika upload create belum selesai, jangan buang antrean file.
  function closeForm() {
    if (submitLockRef.current || tagLockRef.current || formBusy) return;

    if (createdId !== null && imageFiles.length > 0) {
      setFormError(
        "Masih ada gambar yang belum diunggah. Coba upload lagi sebelum menutup form agar antrean file tidak hilang.",
      );
      return;
    }

    invalidateRequests();
    setFormOpen(false);
    resetForm();
  }

  // ## GET daftar tag. Nomor sesi mencegah respons dari modal lama menimpa state baru.
  async function loadTags() {
    const session = formSessionRef.current;
    const request = ++tagRequestRef.current;
    const isStale = () =>
      session !== formSessionRef.current || request !== tagRequestRef.current;

    setIsLoadingTags(true);
    setTagError("");

    try {
      const result = await getAdminNewsTags();
      if (isStale()) return;
      setTags(result.items);
    } catch (error) {
      if (isStale()) return;
      setTagError(errorMessage(error, "Daftar tag gagal dimuat."));
    } finally {
      if (!isStale()) setIsLoadingTags(false);
    }
  }

  // ## CREATE: buka form kosong dan muat daftar tag.
  function openCreate() {
    if (!canCreate) return;

    formSessionRef.current += 1;
    resetForm();
    setFeedback(null);
    setFormOpen(true);
    void loadTags();
  }

  // ## GET detail berita untuk mengisi form edit.
  async function loadDetail(newsId: number) {
    const session = formSessionRef.current;
    const request = ++detailRequestRef.current;
    const isStale = () =>
      session !== formSessionRef.current ||
      request !== detailRequestRef.current;

    setIsLoadingDetail(true);
    setDetailError("");

    try {
      const news = await getAdminNewsByIdentifier(newsId);
      if (isStale()) return;

      setForm({
        title: news.title,
        slug: news.slug,
        content: news.content ?? "",
        status: news.status,
        tagIds: news.tags.map((tag) => tag.id),
      });

      // Pertahankan tag terpasang meskipun request daftar tag gagal.
      setTags((current) => {
        const merged = new Map(current.map((tag) => [tag.id, tag]));
        news.tags.forEach((tag) => merged.set(tag.id, tag));
        return Array.from(merged.values());
      });
    } catch (error) {
      if (isStale()) return;
      setDetailError(errorMessage(error, "Detail berita gagal dimuat."));
    } finally {
      if (!isStale()) setIsLoadingDetail(false);
    }
  }

  // ## EDIT: buka form dan jalankan request detail dan tag secara paralel.
  function openEdit(newsId: number) {
    if (!canUpdate) return;

    formSessionRef.current += 1;
    resetForm();
    setEditingId(newsId);
    setFeedback(null);
    setFormOpen(true);
    void loadTags();
    void loadDetail(newsId);
  }

  // ## Toggle tag yang akan dikaitkan dengan berita.
  function toggleTag(tagId: number, checked: boolean) {
    setForm((current) => ({
      ...current,
      tagIds: checked
        ? Array.from(new Set([...current.tagIds, tagId]))
        : current.tagIds.filter((id) => id !== tagId),
    }));
  }

  // ## CREATE TAG: validasi input, cegah submit ganda, dan pilih tag baru otomatis.
  async function handleCreateTag() {
    const name = newTagName.trim();
    if (!name || tagLockRef.current || formBusy) return;

    // API harus tetap menjadi sumber otoritatif untuk permission tag.
    if (!canCreate && !canUpdate) {
      setTagError(
        "Akun ini tidak memiliki izin mengelola tag dari halaman berita.",
      );
      return;
    }

    tagLockRef.current = true;
    setIsCreatingTag(true);
    setTagError("");

    try {
      const tag = await createAdminNewsTag({ name });
      setTags((current) =>
        current.some((item) => item.id === tag.id) ? current : [...current, tag],
      );
      setForm((current) => ({
        ...current,
        tagIds: Array.from(new Set([...current.tagIds, tag.id])),
      }));
      setNewTagName("");
      setTagCreatorOpen(false);
    } catch (error) {
      setTagError(errorMessage(error, "Tag gagal dibuat."));
    } finally {
      tagLockRef.current = false;
      setIsCreatingTag(false);
    }
  }

  // ## REMOVE IMAGE: hapus file dari antrean sebelum disimpan.
  function removeImage(index: number) {
    if (fieldsLocked) return;
    setImageFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index),
    );
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ## CREATE / UPDATE NEWS: simpan data berita, kemudian upload gambar secara berurutan.
  // Jika upload gagal sesudah create, createdId disimpan agar retry tidak membuat berita duplikat.
  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitLockRef.current || formBusy || isLoadingTags || detailError) {
      return;
    }

    const allowed = isEditing ? canUpdate : canCreate;
    if (!allowed) {
      setFormError("Akun ini tidak memiliki izin menyimpan berita.");
      return;
    }

    if (form.title.trim().length < 2 || !form.content.trim()) {
      setFormError("Judul minimal 2 karakter dan isi berita wajib diisi.");
      return;
    }

    submitLockRef.current = true;
    setIsSaving(true);
    setFormError("");

    let targetId: number | null = editingId ?? createdId;
    let dataSaved = createdId !== null;

    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        status: form.status,
        tag_ids: form.tagIds,
        ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      };

      if (editingId !== null) {
        const updated = await updateAdminNews(editingId, payload);
        targetId = updated.id;
        dataSaved = true;
      } else if (targetId === null) {
        const created = await createAdminNews(payload);
        targetId = created.id;
        dataSaved = true;
        setCreatedId(created.id);
      }

      if (targetId === null) {
        throw new Error("ID berita tidak tersedia untuk mengunggah gambar.");
      }

      // Upload berurutan. Gunakan antrean lokal agar closure React tidak mengulang file pertama.
      let pendingFiles = [...imageFiles];

      while (pendingFiles.length > 0) {
        const nextFile = pendingFiles[0];

        await uploadAdminNewsImage(targetId, nextFile, {
          ...(imageCaption.trim() ? { caption: imageCaption.trim() } : {}),
        });

        pendingFiles = pendingFiles.slice(1);
        setImageFiles(pendingFiles);
        setUploadedImageCount((current) => current + 1);
      }

      const wasEditing = editingId !== null;
      invalidateRequests();
      setFormOpen(false);
      resetForm();
      setFeedback({
        kind: "success",
        message: wasEditing
          ? "Perubahan berita berhasil disimpan."
          : "Berita berhasil ditambahkan.",
      });

      if (!wasEditing) {
        setStatusFilter("all");
        setOffset(0);
      }
      reloadNews();
    } catch (error) {
      const message = errorMessage(error, "Berita tidak dapat disimpan.");
      setFormError(
        dataSaved
          ? `Data berita sudah tersimpan, tetapi proses upload belum selesai: ${message} Coba lagi untuk melanjutkan file yang tersisa.`
          : message,
      );
      if (dataSaved) reloadNews();
    } finally {
      submitLockRef.current = false;
      setIsSaving(false);
    }
  }

  // ## DELETE: buka dialog konfirmasi; penghapusan baru dilakukan setelah pengguna mengonfirmasi.
  function openDelete(news: AdminNews) {
    if (!canDelete) return;
    setDeleteError("");
    setDeleteTarget(news);
  }

  // ## DELETE NEWS: cegah request ganda dan pulihkan halaman bila halaman terakhir menjadi kosong.
  async function handleDelete() {
    if (!deleteTarget || !canDelete || deleteLockRef.current) return;

    deleteLockRef.current = true;
    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteAdminNews(deleteTarget.id);
      setDeleteTarget(null);
      setFeedback({ kind: "success", message: "Berita berhasil dihapus." });

      if (items.length === 1 && currentOffset > 0) {
        setOffset(Math.max(0, currentOffset - PAGE_SIZE));
      } else {
        reloadNews();
      }
    } catch (error) {
      setDeleteError(errorMessage(error, "Berita tidak dapat dihapus."));
    } finally {
      deleteLockRef.current = false;
      setIsDeleting(false);
    }
  }

  // ## ACTIONS: tampilkan aksi berdasarkan permission yang dimiliki akun.
  function renderActions(news: AdminNews) {
    if (!canUpdate && !canDelete) return null;

    return (
      <div className="flex items-center gap-1">
        {canUpdate && (
          <button
            type="button"
            onClick={() => openEdit(news.id)}
            className={styles.text}
            aria-label={`Edit berita ${news.title}`}
          >
            Edit
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={() => openDelete(news)}
            className={styles.dangerSolid}
            aria-label={`Hapus berita ${news.title}`}
          >
            Hapus
          </button>
        )}
      </div>
    );
  }

  if (!admin) return null;

  if (!canView) {
    return (
      <main className="min-h-screen bg-bg-light px-4 py-6 text-ink sm:px-6 sm:py-8">
        <section className="mx-auto max-w-6xl border border-paper-line bg-bg-light p-5 sm:p-8">
          <p className="text-xs text-ink-soft">Administrasi / Publikasi</p>
          <h1 className="mt-4 font-serif text-2xl font-semibold text-bg-dark">
            Akses tidak tersedia
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-6 text-ink-soft">
            Akun ini belum memiliki izin <code>news.view</code> untuk melihat
            daftar berita.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg-light text-ink">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-8 lg:px-8">
        {/* ## PAGE HEADER: ringkas pada layar kecil, dua kolom pada layar lebar. */}
        <header className="border-b border-paper-line pb-5 sm:pb-6">
          <p className="text-[10px] font-semibold uppercase leading-5 tracking-[0.18em] text-gold">
            Konten / Publikasi
          </p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl font-semibold tracking-tight text-bg-dark sm:text-4xl">
                Manajemen Berita
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-ink-soft">
                Kelola konten berita, atur status terbit, dan rapikan tag serta
                gambar pendukung.
              </p>
            </div>
            {canCreate && (
              <button
                type="button"
                onClick={openCreate}
                className={`${styles.primary} w-full sm:w-auto`}
              >
                + Tambah berita
              </button>
            )}
          </div>
        </header>

        {/* ## FEEDBACK: tampilkan hasil operasi dan sediakan tombol menutup notifikasi. */}
        {feedback && (
          <div
            role={feedback.kind === "error" ? "alert" : "status"}
            className={`mt-5 flex items-start justify-between gap-3 border bg-bg-light px-4 ${
              feedback.kind === "error" ? "border-red-300" : "border-gold/40"
            }`}
          >
            <p
              className={`py-3 text-sm leading-6 ${
                feedback.kind === "error" ? "text-red-700" : "text-bg-dark"
              }`}
            >
              {feedback.message}
            </p>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className={styles.text}
            >
              Tutup
            </button>
          </div>
        )}

        {/* ## LIST TOOLBAR: filter status dan refresh tetap mudah dijangkau di mobile. */}
        <section aria-labelledby="news-list-title" className="mt-6">
          <div className="flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="news-list-title"
                className="font-serif text-lg font-semibold text-bg-dark"
              >
                Daftar berita
              </h2>
              <p
                aria-live="polite"
                className="mt-1 text-xs leading-5 text-ink-soft"
              >
                {isLoading
                  ? "Memuat publikasi..."
                  : `${items.length} berita pada halaman ini`}
              </p>
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 sm:w-auto">
              <div className="sm:w-44">
                <label htmlFor="news-filter" className={styles.label}>
                  Status
                </label>
                <select
                  id="news-filter"
                  value={statusFilter}
                  onChange={(event) =>
                    changeStatus(event.target.value as StatusFilter)
                  }
                  disabled={isLoading}
                  className={styles.input}
                >
                  <option value="all">Semua status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Terbit</option>
                  <option value="archived">Arsip</option>
                </select>
              </div>
              <button
                type="button"
                onClick={reloadNews}
                disabled={isLoading}
                className={styles.secondary}
              >
                Muat ulang
              </button>
            </div>
          </div>

          <div
            aria-busy={isLoading}
            className="border border-paper-line bg-bg-light shadow-sm"
          >
            {isLoading ? (
              <NewsListSkeleton />
            ) : listError ? (
              <div role="alert" className="px-4 py-8 sm:px-6">
                <h3 className="text-sm font-semibold">
                  Daftar berita belum dapat ditampilkan
                </h3>
                <p className="mt-2 text-sm leading-6 text-red-700">
                  {listError}
                </p>
                <button
                  type="button"
                  onClick={reloadNews}
                  className={`${styles.secondary} mt-4`}
                >
                  Coba lagi
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="px-4 py-12 sm:px-6 sm:py-16">
                <h3 className="font-serif text-xl font-semibold text-bg-dark">
                  {currentOffset > 0
                    ? "Tidak ada berita di halaman ini"
                    : "Belum ada berita"}
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-ink-soft">
                  {currentOffset > 0
                    ? "Kembali ke halaman sebelumnya untuk melihat berita yang tersedia."
                    : "Berita yang tersedia akan ditampilkan di bagian ini."}
                </p>
                {canCreate && currentOffset === 0 && (
                  <button
                    type="button"
                    onClick={openCreate}
                    className={`${styles.secondary} mt-5`}
                  >
                    Tambah berita
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* ## MOBILE LIST: tiap berita menjadi blok yang nyaman dibaca tanpa tabel horizontal. */}
                <ul className="divide-y divide-paper-line lg:hidden">
                  {items.map((news) => (
                    <li key={news.id} className="px-4 py-4 sm:px-5">
                      <div className="flex items-center justify-between">
                        <StatusBadge status={news.status} />
                        <span className="text-xs text-ink-soft/75">
                          ID {news.id}
                        </span>
                      </div>
                      <h3 className="mt-2 wrap-break-word text-base font-semibold leading-6">
                        {news.title}
                      </h3>
                      <p className="mt-1 break-all text-xs leading-5 text-ink-soft/75">
                        /{news.slug}
                      </p>
                      <div className="mt-3">
                        <NewsTags tags={news.tags} />
                      </div>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-paper-line/70 pt-3">
                        <p className="text-xs leading-5 text-ink-soft">
                          Diperbarui{" "}
                          {formatDate(news.updated_at ?? news.created_at)}
                        </p>
                        {renderActions(news)}
                      </div>
                    </li>
                  ))}
                </ul>

                {/* ## DESKTOP TABLE: hanya muncul ketika lebar layar mencukupi. */}
                <div className="hidden overflow-x-auto lg:block">
                  <table className="w-full table-fixed border-collapse text-left">
                    <caption className="sr-only">
                      Daftar berita organisasi
                    </caption>
                    <thead className="border-b border-paper-line bg-bg-light">
                      <tr className="text-xs font-medium text-ink-soft">
                        <th scope="col" className="w-[40%] px-5 py-3">
                          Berita
                        </th>
                        <th scope="col" className="w-[12%] px-4 py-3">
                          Status
                        </th>
                        <th scope="col" className="w-[18%] px-4 py-3">
                          Tag
                        </th>
                        <th scope="col" className="w-[16%] px-4 py-3">
                          Diperbarui
                        </th>
                        <th
                          scope="col"
                          className="w-[14%] px-4 py-3 text-right"
                        >
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-paper-line/70">
                      {items.map((news) => (
                        <tr key={news.id} className="hover:bg-bg-light-2/60">
                          <td className="px-5 py-4 align-top">
                            <p className="wrap-break-word text-sm font-medium leading-6">
                              {news.title}
                            </p>
                            <p className="mt-1 break-all text-xs leading-5 text-ink-soft/75">
                              /{news.slug}
                            </p>
                            <p className="mt-1 text-xs text-ink-soft/75">
                              ID {news.id}
                            </p>
                          </td>
                          <td className="px-4 py-4 align-top">
                            <StatusBadge status={news.status} />
                          </td>
                          <td className="px-4 py-4 align-top">
                            <NewsTags tags={news.tags} />
                          </td>
                          <td className="px-4 py-4 align-top text-xs leading-5 text-ink-soft">
                            {formatDate(news.updated_at ?? news.created_at)}
                          </td>
                          <td className="px-2 py-2 align-top">
                            <div className="flex justify-end">
                              {renderActions(news)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* ## PAGINATION: hasNextPage berasal dari item tambahan, bukan tebakan jumlah item. */}
            {!isLoading && !listError && (
              <footer className="flex flex-col gap-3 border-t border-paper-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs leading-5 text-ink-soft">
                  Halaman {currentPage}
                  {items.length > 0 && (
                    <span className="ml-2 text-ink-soft/75">
                      Data {currentOffset + 1} sampai{" "}
                      {currentOffset + items.length}
                    </span>
                  )}
                </p>
                <nav
                  aria-label="Navigasi halaman berita"
                  className="grid grid-cols-2 gap-2 sm:flex"
                >
                  <button
                    type="button"
                    disabled={!canPrevious}
                    onClick={() =>
                      changePage(Math.max(0, currentOffset - PAGE_SIZE))
                    }
                    className={styles.secondary}
                  >
                    Sebelumnya
                  </button>
                  <button
                    type="button"
                    disabled={!hasNextPage}
                    onClick={() => changePage(currentOffset + PAGE_SIZE)}
                    className={styles.secondary}
                  >
                    Berikutnya
                  </button>
                </nav>
              </footer>
            )}
          </div>
        </section>
      </div>

      {/* ## FORM DIALOG: full-screen di mobile dan panel terpusat di desktop. */}
      <Dialog
        open={formOpen}
        titleId="news-form-title"
        busy={formBusy}
        onClose={closeForm}
      >
        <section className="flex h-dvh flex-col sm:h-auto sm:max-h-[90dvh]">
          <header className="flex shrink-0 items-start justify-between gap-4 border-b border-paper-line px-4 py-4 sm:px-6 sm:py-5">
            <div>
              <p className="text-xs text-ink-soft">Publikasi berita</p>
              <h2
                id="news-form-title"
                className="mt-1 font-serif text-2xl font-semibold tracking-tight text-bg-dark"
              >
                {isEditing ? "Edit berita" : "Tambah berita"}
              </h2>
              <p className="mt-1 text-xs leading-5 text-ink-soft">
                Judul dan isi berita wajib diisi.
              </p>
            </div>
            <button
              type="button"
              onClick={closeForm}
              disabled={formBusy}
              className={styles.text}
            >
              Tutup
            </button>
          </header>

          <form onSubmit={handleSave} className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
              {formError && (
                <div role="alert" className={styles.alert}>
                  {formError}
                </div>
              )}
              {detailError && (
                <div role="alert" className={styles.alert}>
                  {detailError}
                  <button
                    type="button"
                    onClick={() =>
                      editingId !== null && void loadDetail(editingId)
                    }
                    className={`${styles.text} mt-2`}
                  >
                    Muat ulang detail
                  </button>
                </div>
              )}

              {isLoadingDetail ? (
                <NewsDetailSkeleton />
              ) : (
                <div className="space-y-7">
                  {/* ## NEWS CONTENT: judul, slug, dan isi berita. */}
                  <section aria-labelledby="news-content-heading">
                    <h3
                      id="news-content-heading"
                      className="font-serif text-lg font-semibold text-bg-dark"
                    >
                      Isi berita
                    </h3>
                    <div className="mt-4 space-y-5">
                      <div>
                        <label htmlFor="news-title" className={styles.label}>
                          Judul <span className="text-red-600">*</span>
                        </label>
                        <input
                          id="news-title"
                          value={form.title}
                          onChange={(event) =>
                            updateForm("title", event.target.value)
                          }
                          required
                          minLength={2}
                          maxLength={255}
                          disabled={fieldsLocked}
                          placeholder="Masukkan judul berita"
                          className={styles.input}
                        />
                      </div>
                      <div>
                        <div className="flex items-baseline justify-between gap-3">
                          <label htmlFor="news-slug" className={styles.label}>
                            Slug
                          </label>
                          <span className="text-xs text-ink-soft/75">
                            Opsional
                          </span>
                        </div>
                        <input
                          id="news-slug"
                          value={form.slug}
                          onChange={(event) =>
                            updateForm("slug", event.target.value)
                          }
                          disabled={fieldsLocked}
                          placeholder="judul-berita"
                          className={styles.input}
                        />
                        <p className={styles.help}>
                          {isEditing
                            ? "Slug kosong tidak dikirim sebagai perubahan."
                            : "Kosongkan agar slug dibuat otomatis oleh backend."}
                        </p>
                      </div>
                      <div>
                        <label htmlFor="news-content" className={styles.label}>
                          Isi berita <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          id="news-content"
                          value={form.content}
                          onChange={(event) =>
                            updateForm("content", event.target.value)
                          }
                          required
                          rows={10}
                          disabled={fieldsLocked}
                          placeholder="Tulis isi berita di sini..."
                          className={`${styles.input} min-h-60 resize-y leading-7`}
                        />
                      </div>
                    </div>
                  </section>

                  {/* ## PUBLICATION SETTINGS: status dan relasi tag. */}
                  <section
                    aria-labelledby="news-publication-heading"
                    className="border-t border-paper-line pt-6"
                  >
                    <h3
                      id="news-publication-heading"
                      className="font-serif text-lg font-semibold text-bg-dark"
                    >
                      Pengaturan publikasi
                    </h3>
                    <div className="mt-4 space-y-5">
                      <div className="sm:max-w-xs">
                        <label htmlFor="news-status" className={styles.label}>
                          Status
                        </label>
                        <select
                          id="news-status"
                          value={form.status}
                          onChange={(event) =>
                            updateForm(
                              "status",
                              event.target.value as NewsStatus,
                            )
                          }
                          disabled={fieldsLocked}
                          className={styles.input}
                        >
                          <option value="draft">Draft</option>
                          <option value="published">Terbit</option>
                          <option value="archived">Arsip</option>
                        </select>
                      </div>

                      <fieldset disabled={fieldsLocked}>
                        <legend className="text-sm font-medium text-ink">
                          Tag
                        </legend>
                        <p className={styles.help}>
                          Pilih tag yang berkaitan dengan isi berita.
                        </p>
                        {tagError && (
                          <p
                            role="alert"
                            className="mt-3 text-xs leading-5 text-red-700"
                          >
                            {tagError}
                          </p>
                        )}
                        {isLoadingTags ? (
                          <SkeletonWrapper
                            label="Memuat daftar tag"
                            className="mt-3 grid grid-cols-1 gap-x-4 animate-pulse sm:grid-cols-2 motion-reduce:animate-none"
                          >
                            {[0, 1, 2, 3].map((item) => (
                              <div
                                key={item}
                                className="flex min-h-11 items-center gap-3 border-b border-paper-line/70 py-2"
                              >
                                <span className="h-4 w-4 bg-bg-light-2" />
                                <span className="h-3 w-28 bg-bg-light-2" />
                              </div>
                            ))}
                          </SkeletonWrapper>
                        ) : tags.length === 0 ? (
                          <p className="mt-3 text-sm text-ink-soft/75">
                            Belum ada tag tersedia.
                          </p>
                        ) : (
                          <div className="mt-3 grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                            {tags.map((tag) => (
                              <label
                                key={tag.id}
                                className="flex min-h-11 cursor-pointer items-center gap-3 border-b border-paper-line/70 py-2 text-sm text-ink-soft"
                              >
                                <input
                                  type="checkbox"
                                  checked={form.tagIds.includes(tag.id)}
                                  onChange={(event) =>
                                    toggleTag(tag.id, event.target.checked)
                                  }
                                  className="h-4 w-4 shrink-0 accent-bg-dark"
                                />
                                <span className="wrap-break-word">
                                  {tag.name}
                                </span>
                              </label>
                            ))}
                          </div>
                        )}
                        <div className="mt-2 flex flex-wrap gap-1">
                          <button
                            type="button"
                            onClick={() => setTagCreatorOpen((value) => !value)}
                            aria-expanded={tagCreatorOpen}
                            aria-controls="news-tag-creator"
                            className={styles.text}
                          >
                            {tagCreatorOpen
                              ? "Batal tambah tag"
                              : "Tambah tag baru"}
                          </button>
                          {tagError && (
                            <button
                              type="button"
                              onClick={() => void loadTags()}
                              disabled={isLoadingTags}
                              className={styles.text}
                            >
                              Muat ulang tag
                            </button>
                          )}
                        </div>
                        {tagCreatorOpen && (
                          <div
                            id="news-tag-creator"
                            className="mt-2 border border-paper-line bg-bg-light p-3"
                          >
                            <label
                              htmlFor="news-new-tag"
                              className={styles.label}
                            >
                              Nama tag baru
                            </label>
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input
                                id="news-new-tag"
                                value={newTagName}
                                onChange={(event) =>
                                  setNewTagName(event.target.value)
                                }
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") {
                                    event.preventDefault();
                                    void handleCreateTag();
                                  }
                                }}
                                maxLength={100}
                                placeholder="Contoh: Kegiatan"
                                className={styles.input}
                              />
                              <button
                                type="button"
                                onClick={() => void handleCreateTag()}
                                disabled={
                                  !newTagName.trim() ||
                                  isCreatingTag ||
                                  isLoadingTags
                                }
                                className={`${styles.secondary} shrink-0`}
                              >
                                {isCreatingTag ? (
                                  <>
                                    <Spinner /> Menyimpan
                                  </>
                                ) : (
                                  "Simpan tag"
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </fieldset>
                    </div>
                  </section>

                  {/* ## IMAGE UPLOAD: file diunggah setelah berita mempunyai ID. */}
                  <section
                    aria-labelledby="news-images-heading"
                    className="border-t border-paper-line pt-6"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <h3
                        id="news-images-heading"
                        className="font-serif text-lg font-semibold text-bg-dark"
                      >
                        Gambar pendukung
                      </h3>
                      <span className="text-xs text-ink-soft/75">Opsional</span>
                    </div>
                    <p className={styles.help}>
                      Gambar baru akan diunggah setelah data berita tersimpan.
                    </p>
                    <div className="mt-4">
                      <label htmlFor="news-images" className={styles.label}>
                        Pilih gambar
                      </label>
                      <input
                        ref={fileInputRef}
                        id="news-images"
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={fieldsLocked}
                        onChange={(event) =>
                          setImageFiles(Array.from(event.target.files ?? []))
                        }
                        className="block min-h-12 w-full min-w-0 border border-paper-line bg-bg-light text-xs text-ink-soft file:mr-3 file:min-h-11 file:border-0 file:border-r file:border-paper-line file:bg-bg-light file:px-3 file:text-sm file:font-medium file:text-ink-soft disabled:opacity-50"
                      />
                      <p className={styles.help}>
                        Format dan batas ukuran mengikuti validasi backend.
                      </p>
                    </div>
                    {uploadedImageCount > 0 && (
                      <p
                        role="status"
                        className="mt-3 text-xs leading-5 text-ink-soft"
                      >
                        {uploadedImageCount} gambar berhasil diunggah pada
                        sesi ini.
                      </p>
                    )}
                    {imageFiles.length > 0 && (
                      <ul className="mt-4 divide-y divide-paper-line border-y border-paper-line">
                        {imageFiles.map((file, index) => (
                          <li
                            key={`${file.name}-${file.lastModified}-${index}`}
                            className="flex items-center justify-between gap-3 py-3"
                          >
                            <div className="min-w-0">
                              <p className="break-all text-xs leading-5 text-ink">
                                {file.name}
                              </p>
                              <p className="text-xs leading-5 text-ink-soft/75">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              disabled={fieldsLocked || createdId !== null}
                              className={styles.text}
                            >
                              Hapus
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-4">
                      <label
                        htmlFor="news-image-caption"
                        className={styles.label}
                      >
                        Caption gambar
                      </label>
                      <input
                        id="news-image-caption"
                        value={imageCaption}
                        onChange={(event) => setImageCaption(event.target.value)}
                        disabled={fieldsLocked}
                        maxLength={500}
                        placeholder="Keterangan gambar (opsional)"
                        className={styles.input}
                      />
                      <p className={styles.help}>
                        Caption ini diterapkan ke semua gambar yang dipilih
                        pada sesi ini.
                      </p>
                    </div>
                  </section>
                </div>
              )}
            </div>

            {/* ## FORM ACTIONS: tombol tetap terlihat dan mengikuti safe area perangkat mobile. */}
            <footer className="shrink-0 border-t border-paper-line bg-bg-light px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p
                  aria-live="polite"
                  className="text-xs leading-5 text-ink-soft"
                >
                  {isSaving
                    ? "Menyimpan berita dan mengunggah gambar..."
                    : createdId !== null
                      ? "Berita sudah tersimpan. Selesaikan upload gambar yang tersisa."
                      : isEditing
                        ? "Periksa perubahan sebelum menyimpan."
                        : "Periksa isi berita sebelum menyimpan."}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:flex sm:shrink-0">
                  <button
                    type="button"
                    onClick={closeForm}
                    disabled={formBusy}
                    className={styles.secondary}
                  >
                    {createdId !== null ? "Tutup" : "Batal"}
                  </button>
                  <button
                    type="submit"
                    disabled={formBusy || isLoadingTags || Boolean(detailError)}
                    className={styles.primary}
                  >
                    {isSaving ? (
                      <>
                        <Spinner /> Menyimpan
                      </>
                    ) : createdId !== null ? (
                      "Coba upload lagi"
                    ) : isEditing ? (
                      "Simpan perubahan"
                    ) : (
                      "Simpan berita"
                    )}
                  </button>
                </div>
              </div>
            </footer>
          </form>
        </section>
      </Dialog>

      {/* ## DELETE DIALOG: konfirmasi sebelum operasi destruktif. */}
      <Dialog
        open={deleteTarget !== null}
        titleId="news-delete-title"
        busy={isDeleting}
        compact
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
      >
        {deleteTarget && (
          <section className="px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6">
            <p className="text-xs text-ink-soft">Konfirmasi tindakan</p>
            <h2
              id="news-delete-title"
              className="mt-2 font-serif text-2xl font-semibold tracking-tight text-bg-dark"
            >
              Hapus berita
            </h2>
            <p className="mt-4 wrap-break-word text-sm font-medium leading-6 text-ink">
              {deleteTarget.title}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-soft">
              Berita ini akan dihapus. Tindakan ini tidak dapat dibatalkan dari
              halaman ini.
            </p>
            {deleteError && (
              <p
                role="alert"
                className="mt-4 border-l-2 border-red-500 pl-3 text-sm leading-6 text-red-700"
              >
                {deleteError}
              </p>
            )}
            <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setDeleteTarget(null)}
                className={styles.secondary}
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => void handleDelete()}
                className={styles.danger}
              >
                {isDeleting ? (
                  <>
                    <Spinner /> Menghapus
                  </>
                ) : (
                  "Hapus berita"
                )}
              </button>
            </div>
          </section>
        )}
      </Dialog>
    </main>
  );
}