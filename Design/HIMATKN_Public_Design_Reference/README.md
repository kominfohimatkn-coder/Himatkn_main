# HIMATKN Public Website Design Reference

Folder ini adalah acuan visual HTML/CSS/JS untuk membangun public website HIMATKN di Next.js.

## Prinsip desain

Visual mengikuti screenshot dan Figma yang diberikan: hijau gelap, cream/off-white, gold, serif editorial untuk heading, sans serif untuk UI, garis tipis, whitespace luas, border tipis, radius kecil, dan tidak memakai brand icon dari huruf.

Header, footer, tombol, selector struktur, card publikasi, state, dan responsive behavior memakai satu stylesheet serta satu icon set agar konsisten.

## Public API yang dipakai sebagai batas fitur

Backend current source menyediakan:

- `GET /api/v1/public/news`
- `GET /api/v1/public/news/{slug}`
- `GET /api/v1/public/programs`
- `GET /api/v1/public/organization`
- `POST /api/v1/public/visits`

Karena itu, desain public hanya membuat fitur data yang bisa ditopang endpoint tersebut.

## Hal yang sengaja tidak dibuat sebagai route public baru

Backend tidak menyediakan endpoint public untuk agenda, documents, site settings, admin management, atau standalone gallery. Dokumen dan agenda hanya tersedia pada router admin saat ini. Gallery yang dibuat di reference ini hanya merupakan gallery `news_images` di detail publikasi, karena image tersebut memang dikembalikan oleh endpoint public news detail.

Backend juga belum menyediakan `GET /api/v1/public/programs/{slug}`. Karena itu tidak ada halaman detail program kerja public yang mengasumsikan endpoint tersebut. `program-kerja-filled.html` hanya menunjukkan bagaimana list state yang terisi akan ditata menggunakan field yang benar-benar ada.

## Struktur kepengurusan

`struktur.html` menggunakan konsep `Per Divisi` dan `Lihat Semua` sesuai screenshot yang diberikan. Dropdown menampilkan divisi, kemudian card anggota ditampilkan berdasarkan `division_id` dan jabatan berdasarkan `position_id`. Data contoh memakai data yang terlihat pada dump database local yang diberikan, tetapi pada Next.js nantinya data harus berasal dari `GET /api/v1/public/organization`.

## State yang dicakup

`404.html` adalah global visitor not-found ketika URL tidak cocok dengan route.

`publikasi-not-found.html` adalah resource-level 404 untuk slug publikasi yang tidak ditemukan atau tidak published.

`403.html` adalah forbidden state.

`503-maintenance.html` adalah maintenance state. Backend saat ini tidak mempunyai endpoint maintenance khusus, sehingga implementasi sebenarnya dapat diletakkan di middleware/config frontend.

`publikasi-empty.html` adalah empty news.

`program-kerja.html` adalah empty program kerja. Dump database saat ini tidak berisi program, sehingga empty state menjadi default acuan.

`struktur-empty.html` adalah empty structure ketika tidak ada period aktif.

`struktur-empty-divisi.html` adalah empty division ketika divisi ada tetapi tidak memiliki member.

`loading.html`, `error-api.html`, `429.html`, dan `offline.html` menutup celah async, rate limit, dan client connectivity.

`publikasi-detail.html` juga memuat state ketika featured image null dan `images[]` kosong. `publikasi-detail-gallery.html` menunjukkan state ketika `images[]` terisi.

## Implementasi Next.js nanti

Jadikan file ini reference visual, bukan source runtime. Struktur akhirnya dapat dipetakan menjadi `app/page.tsx`, `app/tentang/page.tsx`, `app/program-kerja/page.tsx`, `app/publikasi/page.tsx`, `app/publikasi/[slug]/page.tsx`, `app/struktur/page.tsx`, dan `app/not-found.tsx` beserta reusable components.

Jangan hardcode data database di production frontend. Data pada HTML struktur hanya fixture visual.
