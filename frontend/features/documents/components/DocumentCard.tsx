import { FileText, FolderOpen } from "lucide-react";

import { PublicLabel } from "@/components/public/PublicLabel";
import { formatDateShort } from "@/lib/format-date";

import { driveTarget, type PublicDocument } from "../data";

/** Tombol kecil `.btn--sm` di prototipe (padding 11px 16px, huruf 11px). */
const actionBase =
  "inline-flex max-[640px]:flex-1 items-center justify-center gap-2 rounded-[4px] border px-4 py-[11px] text-[11px] leading-none font-semibold tracking-[0.08em] uppercase transition-colors";
const outlineAction = `${actionBase} border-[#C9D4CE] bg-white text-green-900 hover:border-green-800`;
const solidAction = `${actionBase} border-green-800 bg-green-800 text-white hover:border-green-700 hover:bg-green-700`;

/**
 * Kartu dokumen, mengikuti `.doc` di Design/assets/style.css. Link folder
 * Drive menampilkan tombol "Buka di Drive"; link file menampilkan "Lihat" +
 * "Unduh". Link yang tidak dikenali tetap tampil tanpa tombol.
 */
export function DocumentCard({ document }: { document: PublicDocument }) {
  const target = driveTarget(document.drive);
  const isFolder = target?.kind === "folder";
  const updated = formatDateShort(document.updated ?? null);
  const meta = [
    isFolder ? "Folder Google Drive" : "PDF",
    document.size,
    updated ? `Diperbarui ${updated}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <article
      data-reveal
      className="grid grid-cols-[52px_1fr] gap-[18px] rounded-[3px] border border-line bg-white p-6 transition-colors hover:border-[#B9C6BF] max-[640px]:grid-cols-[40px_1fr] max-[640px]:gap-3.5 max-[640px]:p-[18px]"
    >
      <div
        aria-hidden="true"
        className="grid h-[62px] w-[52px] place-items-center content-center gap-0.5 rounded-[3px] bg-mint text-green-800 max-[640px]:h-12 max-[640px]:w-10"
      >
        {isFolder ? (
          <FolderOpen className="size-[22px]" strokeWidth={1.6} />
        ) : (
          <FileText className="size-[22px]" strokeWidth={1.6} />
        )}
        <span className="text-[9px] font-bold tracking-[0.08em]">
          {isFolder ? "FOLDER" : "PDF"}
        </span>
      </div>

      <div className="min-w-0">
        <PublicLabel>{document.category}</PublicLabel>
        <h2 className="mt-2 font-serif text-lg leading-[1.3] font-bold text-green-900 max-[640px]:text-[17px]">
          {document.title}
        </h2>
        <p className="mt-2 max-w-[52ch] text-sm text-muted">
          {document.description}
        </p>
        <p className="mt-2.5 text-xs text-muted">{meta}</p>

        {target ? (
          <div className="mt-[18px] flex flex-wrap gap-2.5">
            {target.kind === "folder" ? (
              <a
                href={target.view}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Buka folder ${document.title} di Google Drive (tab baru)`}
                className={solidAction}
              >
                Buka di Drive <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <>
                <a
                  href={target.view}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Lihat ${document.title} di Google Drive (tab baru)`}
                  className={outlineAction}
                >
                  Lihat <span aria-hidden="true">↗</span>
                </a>
                <a
                  href={target.download}
                  rel="noopener noreferrer"
                  aria-label={`Unduh ${document.title} (PDF${document.size ? `, ${document.size}` : ""}) dari Google Drive`}
                  className={solidAction}
                >
                  Unduh
                </a>
              </>
            )}
          </div>
        ) : null}
      </div>
    </article>
  );
}