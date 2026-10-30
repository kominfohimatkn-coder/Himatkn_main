import { ArrowRight } from "lucide-react";

import { RefreshButton } from "@/components/public/RefreshButton";
import { ButtonLink } from "@/components/ui/Button";
import type { PublicOrganizationResponse } from "@/types/organization";

type OrganizationSectionProps = {
  data: PublicOrganizationResponse | null;
  hasError: boolean;
};

export function OrganizationSection({
  data,
  hasError,
}: OrganizationSectionProps) {
  const period = data?.period ?? null;
  const members = data?.members ?? [];

  return (
    <section
      id="struktur"
      className="public-section bg-paper"
      aria-labelledby="structure-title"
    >
      <div className="site-container">
        <div className="structure-teaser">
          <div className="structure-teaser__intro">
            <p className="kicker">Struktur kepengurusan</p>
            <h2 id="structure-title" className="section-title mt-3">
              Satu kepengurusan, banyak peran.
            </h2>
            <p className="section-copy">
              Kenali susunan pengurus, divisi, dan peran yang menjalankan
              HIMATKN pada periode aktif.
            </p>
          </div>

          <div className="structure-teaser__panel">
            {hasError ? (
              <div role="alert">
                <p className="structure-teaser__state-title">
                  Struktur belum dapat dimuat.
                </p>
                <p className="structure-teaser__state-copy">
                  Koneksi ke layanan organisasi sedang bermasalah. Coba muat
                  kembali halaman ini.
                </p>
                <div className="structure-teaser__actions">
                  <RefreshButton />
                </div>
              </div>
            ) : !period ? (
              <div>
                <p className="structure-teaser__state-title">
                  Belum ada periode kepengurusan aktif.
                </p>
                <p className="structure-teaser__state-copy">
                  Susunan pengurus akan tampil setelah periode aktif
                  dipublikasikan.
                </p>
              </div>
            ) : (
              <>
                <dl className="structure-teaser__stats">
                  <div>
                    <dt>Periode aktif</dt>
                    <dd>{period.name}</dd>
                  </div>
                  <div>
                    <dt>Anggota</dt>
                    <dd>{members.length}</dd>
                  </div>
                </dl>

                <div className="structure-teaser__actions">
                  <ButtonLink href="/struktur" variant="dark">
                    Selengkapnya
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </ButtonLink>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
