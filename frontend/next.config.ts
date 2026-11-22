import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Alamat lama V1 dialihkan permanen (308) ke alamat V2, supaya tautan yang
   * pernah dibagikan dan hasil pencarian Google tetap jalan.
   */
  async redirects() {
    return [
      { source: "/berita", destination: "/publikasi", permanent: true },
      { source: "/berita/:slug", destination: "/publikasi/:slug", permanent: true },
      { source: "/news", destination: "/publikasi", permanent: true },
      // V1 /news/<nomor> memakai id angka yang tidak ada padanannya di V2.
      { source: "/news/:id", destination: "/publikasi", permanent: true },
      { source: "/structure", destination: "/struktur", permanent: true },
      { source: "/admin/login", destination: "/login", permanent: true },
    ];
  },
};

export default nextConfig;