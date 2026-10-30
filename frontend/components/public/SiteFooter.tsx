import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-tone="dark"
      className="border-t border-line-light bg-deep text-on-dark-soft"
    >
      <div className="site-container flex flex-col gap-2 py-5 text-[10px] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {year} HIMATKN — Himpunan Mahasiswa Teknokimia Nuklir
        </p>

        <nav
          aria-label="Tautan footer"
          className="flex items-center gap-4"
        >
          <Link
            href="/struktur"
            className="w-fit py-1.5 hover:text-gold-bright"
          >
            Struktur
          </Link>
          <a href="#top" className="w-fit py-1.5 hover:text-gold-bright">
            Kembali ke atas
          </a>
        </nav>
      </div>
    </footer>
  );
}
