"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState, type DragEvent } from "react";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  ImageIcon,
  Trash2,
  TriangleAlert,
  Upload,
} from "lucide-react";

import { Card } from "@/components/admin/shared/Card";
import ConfirmDialog from "@/components/admin/shared/ConfirmDialog";
import { useToast } from "@/components/admin/shared/Toast";
import { Button } from "@/components/ui/Button";
import { resolveMediaUrl } from "@/lib/media/api";

import {
  deleteAdminNewsImage,
  updateAdminNewsImage,
  uploadAdminNewsImage,
} from "../../admin-api";
import type { NewsImage } from "../../types";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

type Pending = { key: string; preview: string };

function errorMessage(err: unknown, fallback: string) {
  return err instanceof Error && err.message ? err.message : fallback;
}

/**
 * Galeri publikasi, mengikuti `renderGallery()` di Design/admin.
 * Gambar pertama = sampul. Setiap aksi langsung tersimpan lewat endpoint
 * gambar, terpisah dari tombol Simpan publikasi.
 */
export function NewsGallery({
  newsId,
  images,
  editable,
  onImagesChange,
  onSaveFirst,
}: {
  /** `null` untuk publikasi yang belum disimpan. */
  newsId: number | null;
  images: NewsImage[];
  editable: boolean;
  onImagesChange: (images: NewsImage[]) => void;
  onSaveFirst: () => void;
}) {
  const toast = useToast();
  const [pending, setPending] = useState<Pending[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [dropOver, setDropOver] = useState(false);
  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [removeBusy, setRemoveBusy] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const imagesRef = useRef(images);

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  const head = (
    <span className="text-xs text-muted">{images.length} gambar</span>
  );

  if (newsId === null) {
    return (
      <Card title="Galeri gambar" action={head}>
        <div className="rounded-[4px] border-[1.5px] border-dashed border-line-strong bg-mint-50 px-3 py-[18px] text-center">
          <ImageIcon aria-hidden="true" className="mx-auto mb-2 size-[26px] text-green-700" />
          <p className="mb-3 text-[13px] text-muted">
            <strong className="text-green-900">Simpan draft dulu untuk menambahkan gambar.</strong>
            <br />
            Gambar baru bisa diunggah setelah publikasi tersimpan.
          </p>
          {editable ? (
            <Button variant="outline" size="sm" onClick={onSaveFirst}>
              Simpan draft
            </Button>
          ) : null}
        </div>
      </Card>
    );
  }

  const id = newsId;

  async function upload(files: File[]) {
    const errors: string[] = [];

    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: Format tidak didukung. Gunakan JPG, PNG, atau WebP.`);
        continue;
      }

      const item = { key: `${Date.now()}-${Math.random()}`, preview: URL.createObjectURL(file) };
      setPending((current) => [...current, item]);

      try {
        const current = imagesRef.current;
        const nextOrder = current.reduce((max, image) => Math.max(max, image.sort_order), -1) + 1;
        const saved = await uploadAdminNewsImage(id, file, { sort_order: nextOrder });
        imagesRef.current = [...imagesRef.current, saved];
        onImagesChange(imagesRef.current);
        toast("Gambar ditambahkan.");
      } catch (err) {
        errors.push(`${file.name}: ${errorMessage(err, "Gagal mengunggah.")}`);
      } finally {
        URL.revokeObjectURL(item.preview);
        setPending((current) => current.filter((p) => p.key !== item.key));
      }
    }

    setUploadErrors(errors);
  }

  async function reorder(from: number, to: number) {
    if (from === to || to < 0 || to >= images.length) return;

    const previous = images;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    const renumbered = next.map((image, index) => ({ ...image, sort_order: index }));
    onImagesChange(renumbered);

    try {
      await Promise.all(
        renumbered
          .filter((image) => previous.find((p) => p.id === image.id)?.sort_order !== image.sort_order)
          .map((image) => updateAdminNewsImage(id, image.id, { sort_order: image.sort_order })),
      );
      toast(to === 0 ? "Urutan disimpan. Sampul diperbarui." : "Urutan gambar disimpan.");
    } catch (err) {
      onImagesChange(previous);
      toast(errorMessage(err, "Urutan gagal disimpan."), "error");
    }
  }

  async function saveCaption(image: NewsImage, caption: string) {
    if ((image.caption ?? "") === caption.trim()) return;

    try {
      const saved = await updateAdminNewsImage(id, image.id, { caption: caption.trim() });
      onImagesChange(images.map((item) => (item.id === image.id ? { ...item, caption: saved.caption } : item)));
      toast("Keterangan disimpan.");
    } catch (err) {
      toast(errorMessage(err, "Keterangan gagal disimpan."), "error");
    }
  }

  async function confirmRemove() {
    if (removing === null) return;
    const image = images[removing];
    setRemoveBusy(true);
    setRemoveError("");

    try {
      await deleteAdminNewsImage(id, image.id);
      onImagesChange(images.filter((item) => item.id !== image.id));
      setRemoving(null);
      toast("Gambar dihapus.");
    } catch (err) {
      setRemoveError(errorMessage(err, "Gambar gagal dihapus."));
    } finally {
      setRemoveBusy(false);
    }
  }

  function onDrop(event: DragEvent<HTMLLIElement>, to: number) {
    event.preventDefault();
    setDragOver(null);
    if (dragFrom !== null) void reorder(dragFrom, to);
    setDragFrom(null);
  }

  return (
    <Card title="Galeri gambar" action={head}>
      <p className="mb-2.5 text-xs text-muted">
        Gambar pertama dipakai sebagai sampul di situs.
        {editable ? " Seret atau pakai tombol panah untuk mengubah urutan." : ""}
      </p>

      {images.length || pending.length ? (
        <ol className="mb-3 grid list-none gap-2 p-0">
          {images.map((image, i) => (
            <li
              key={image.id}
              draggable={editable}
              onDragStart={(event) => {
                setDragFrom(i);
                event.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => {
                setDragFrom(null);
                setDragOver(null);
              }}
              onDragOver={(event) => {
                if (dragFrom === null) return;
                event.preventDefault();
                setDragOver(i);
              }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(event) => onDrop(event, i)}
              className={`flex flex-wrap items-start gap-2.5 rounded-[4px] border bg-white p-2 transition ${
                dragOver === i && dragFrom !== i
                  ? "border-green-800 shadow-[0_0_0_2px_rgba(15,77,54,0.15)]"
                  : "border-line"
              } ${dragFrom === i ? "opacity-45" : ""}`}
            >
              {editable ? (
                <span aria-hidden="true" title="Seret untuk mengurutkan" className="cursor-grab pt-[22px] text-muted-light">
                  <GripVertical className="size-3.5" />
                </span>
              ) : null}
              <div className="relative grid aspect-[4/3] w-[84px] shrink-0 place-items-center overflow-hidden rounded-[3px] bg-[#dce5e0] text-muted max-[640px]:w-[72px]">
                {resolveMediaUrl(image.url) ? (
                  <img src={resolveMediaUrl(image.url)!} alt="" className="absolute inset-0 size-full object-cover" />
                ) : (
                  <ImageIcon aria-hidden="true" className="size-5" />
                )}
                {i === 0 ? (
                  <span className="absolute top-1 left-1 z-1 rounded-[3px] bg-green-800 px-1.5 py-[3px] text-[11px] leading-none font-bold tracking-[0.04em] text-white">
                    Sampul
                  </span>
                ) : null}
              </div>
              <div className="grid min-w-0 flex-1 gap-1.5">
                <label className="sr-only" htmlFor={`cap-${image.id}`}>
                  Keterangan gambar {i + 1}
                </label>
                <input
                  id={`cap-${image.id}`}
                  defaultValue={image.caption ?? ""}
                  readOnly={!editable}
                  maxLength={500}
                  placeholder="Keterangan (opsional)"
                  onBlur={(event) => editable && void saveCaption(image, event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      event.currentTarget.blur();
                    }
                  }}
                  className="w-full rounded-[4px] border border-line bg-white px-2.5 py-[7px] text-[13px] text-ink outline-none placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] read-only:bg-mint-50 read-only:text-muted"
                />
                {editable ? (
                  <div className="flex gap-0.5">
                    <Button variant="ghost" size="icon" className="size-7!" disabled={i === 0} aria-label={`Naikkan gambar ${i + 1}`} onClick={() => void reorder(i, i - 1)}>
                      <ChevronUp aria-hidden="true" />
                    </Button>
                    <Button variant="ghost" size="icon" className="size-7!" disabled={i === images.length - 1} aria-label={`Turunkan gambar ${i + 1}`} onClick={() => void reorder(i, i + 1)}>
                      <ChevronDown aria-hidden="true" />
                    </Button>
                    <span className="flex-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7! hover:text-danger"
                      aria-label={`Hapus gambar ${i + 1}`}
                      onClick={() => {
                        setRemoveError("");
                        setRemoving(i);
                      }}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
          {pending.map((item) => (
            <li key={item.key} className="flex items-center gap-2.5 rounded-[4px] border border-line bg-white p-2">
              <div className="relative aspect-[4/3] w-[84px] shrink-0 overflow-hidden rounded-[3px] bg-[#dce5e0] max-[640px]:w-[72px]">
                <img src={item.preview} alt="" className="absolute inset-0 size-full object-cover opacity-60" />
                <div role="progressbar" aria-label="Mengunggah" className="absolute inset-x-1.5 bottom-1.5 z-1 h-1 overflow-hidden rounded-[2px] bg-white/70">
                  <span className="block h-full w-2/5 animate-pulse bg-green-800" />
                </div>
              </div>
              <span className="text-[13px] text-muted">Mengunggah…</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mb-2.5 text-[13px] text-muted">Belum ada gambar.</p>
      )}

      {editable ? (
        <>
          <label
            onDragOver={(event) => {
              if (dragFrom !== null) return;
              event.preventDefault();
              setDropOver(true);
            }}
            onDragLeave={() => setDropOver(false)}
            onDrop={(event) => {
              if (dragFrom !== null) return;
              event.preventDefault();
              setDropOver(false);
              void upload([...event.dataTransfer.files]);
            }}
            className={`grid cursor-pointer justify-items-center gap-1 rounded-[4px] border-[1.5px] border-dashed p-3.5 text-center transition-colors hover:border-green-800 hover:bg-mint has-focus-visible:border-green-800 ${
              uploadErrors.length
                ? "border-danger bg-danger-bg"
                : dropOver
                  ? "border-green-800 bg-mint"
                  : "border-line-strong bg-mint-50"
            }`}
          >
            <Upload aria-hidden="true" className="mb-0.5 size-[26px] text-green-800" />
            <strong className="text-green-900">Tambah gambar</strong>
            <span className="text-xs text-muted">
              JPG, PNG, atau WebP · maks 4 MB per file · otomatis dikompres
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(event) => {
                const files = [...(event.target.files ?? [])];
                event.target.value = "";
                void upload(files);
              }}
            />
          </label>
          {uploadErrors.length ? (
            <p role="alert" className="mt-2 flex items-start gap-1.5 text-xs text-danger">
              <TriangleAlert aria-hidden="true" className="mt-px size-[13px] shrink-0" />
              <span>
                {uploadErrors.map((message, i) => (
                  <span key={i} className="block">
                    {message}
                  </span>
                ))}
              </span>
            </p>
          ) : null}
        </>
      ) : null}

      <ConfirmDialog
        open={removing !== null}
        title="Hapus gambar ini?"
        description={
          removing === 0
            ? "Gambar ini adalah sampul. Setelah dihapus, gambar berikutnya menjadi sampul."
            : "Gambar akan dihapus dari galeri publikasi."
        }
        confirmLabel="Hapus"
        busyLabel="Menghapus..."
        busy={removeBusy}
        error={removeError}
        onCancel={() => setRemoving(null)}
        onConfirm={confirmRemove}
      />
    </Card>
  );
}