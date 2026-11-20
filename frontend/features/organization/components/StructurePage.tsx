import { RefreshButton } from "@/components/public/RefreshButton";
import { StructureDirectory } from "./StructureDirectory";
import { ButtonLink } from "@/components/ui/Button";
import type { PublicOrganizationResponse } from "../types";

type StructurePageProps = {
  data: PublicOrganizationResponse | null;
  hasError: boolean;
  eyebrow: string;
  title: string;
  description: string;
};

export function StructurePage({
  data,
  hasError,
  eyebrow,
  title,
  description,
}: StructurePageProps) {
  const period = data?.period ?? null;
  const divisions = data?.divisions ?? [];
  const members = data?.members ?? [];

  return (
    <div className="structure-page" data-tone="dark">
      
      <section
        className="structure-hero"
        aria-labelledby="structure-page-title"
      >
        <div className="site-container text-center">
          <p className="kicker kicker--dark">{eyebrow}</p>

          {period ? (
            <div className="structure-hero__meta justify-center">
              <span className="structure-badge">
                Periode {period.name}
              </span>
              <span className="structure-badge">
                {members.length} anggota
              </span>
            </div>
          ) : null}

          <h1
            id="structure-page-title"
            className="mx-auto w-full text-center"
          >
            {title}
          </h1>

          {description ? (
            <p className="structure-hero__copy mx-auto text-center">
              {description}
            </p>
          ) : null}
        </div>
      </section>


      <section
        className="structure-content"
        aria-label="Daftar kepengurusan"
      >
        <div className="site-container">
          {hasError ? (
            <div
              className="structure-page-state empty-panel empty-panel--dark"
              role="alert"
            >
              <p className="structure-eyebrow">Struktur</p>
              <h2 className="empty-panel__title">
                Struktur belum dapat dimuat.
              </h2>
              <p className="empty-panel__copy">
                Koneksi ke layanan organisasi sedang bermasalah. Coba muat
                kembali halaman ini.
              </p>
              <div className="empty-panel__actions">
                <RefreshButton variant="secondary" />
              </div>
            </div>
          ) : !data || !data.period ? (
            <div className="structure-page-state empty-panel empty-panel--dark">
              <p className="structure-eyebrow">Periode</p>
              <h2 className="empty-panel__title">
                Belum ada periode kepengurusan aktif
              </h2>
              <p className="empty-panel__copy">
                Struktur belum dapat ditampilkan karena belum ada periode
                aktif yang dipublikasikan.
              </p>
              <div className="empty-panel__actions">
                <ButtonLink href="/" variant="secondary">
                  Kembali ke beranda
                </ButtonLink>
              </div>
            </div>
          ) : divisions.length === 0 && members.length === 0 ? (
            <div className="structure-page-state empty-panel empty-panel--dark">
              <p className="structure-eyebrow">Divisi</p>
              <h2 className="empty-panel__title">
                Belum ada divisi pada periode ini
              </h2>
              <p className="empty-panel__copy">
                Periode aktif tersedia, tetapi daftar divisi belum diisi.
              </p>
              <div className="empty-panel__actions">
                <ButtonLink href="/" variant="secondary">
                  Kembali ke beranda
                </ButtonLink>
              </div>
            </div>
          ) : (
            <StructureDirectory data={data} />
          )}
        </div>
      </section>
    </div>
  );
}
