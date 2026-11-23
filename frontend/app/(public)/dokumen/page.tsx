import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { PublicButtonAnchor } from "@/components/public/PublicButton";
import { PublicPageHeader } from "@/components/public/PublicPageHeader";
import { PublicStateBox } from "@/components/public/PublicStateBox";
import { DocumentCard } from "@/features/documents/components/DocumentCard";
import { DOCUMENTS } from "@/features/documents/data";

export const metadata: Metadata = {
  title: "Dokumen",
  description:
    "Dokumen resmi HIMATKN yang dapat dilihat langsung atau diunduh.",
  alternates: { canonical: "/dokumen" },
};

/** Halaman Dokumen, mengikuti Design/dokumen.html. Data statis di `features/documents/data.ts`. */
export default function DokumenPage() {
  return (
    <section className="min-h-[60vh] pt-16 pb-20 min-[641px]:pt-[104px] min-[641px]:pb-[120px]">
      <div className="site-container">
        <PublicPageHeader
          title="Dokumen"
          intro="Dokumen resmi HIMATKN yang dapat dilihat langsung atau diunduh."
        />

        {DOCUMENTS.length === 0 ? (
          <PublicStateBox
            icon={<FileText className="size-[22px]" strokeWidth={1.6} />}
            label="Dokumen"
            title="Belum ada dokumen"
            action={
              <PublicButtonAnchor tone="outline" href="mailto:himatknuklir@gmail.com">
                Hubungi kami
              </PublicButtonAnchor>
            }
          >
            Dokumen resmi HIMATKN akan tersedia di sini. Butuh dokumen
            tertentu? Hubungi himatknuklir@gmail.com.
          </PublicStateBox>
        ) : (
          <div className="grid gap-3.5 min-[641px]:grid-cols-2">
            {DOCUMENTS.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}