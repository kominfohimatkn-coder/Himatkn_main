# Konvensi Frontend HIMATKN V2

Dokumen acuan untuk semua pekerjaan frontend, baik manual maupun lewat OpenCode. Kalau ada aturan lain yang bertentangan, dokumen ini yang berlaku. Batch yang belum memenuhi aturan ini dicatat di bagian "Utang teknis" sampai dibereskan.

Prinsip utama: **setiap keputusan desain ada di satu tempat, dan tidak ada yang bisa diam-diam menimpanya.**

---

## 1. Sumber kebenaran

| Hal | Sumber |
|---|---|
| Tampilan publik | `Design/*.html`, `Design/assets/style.css`, `Design/assets/app.js` |
| Tampilan admin | `Design/admin/*` (`admin.css`, `admin.js`, `README.md`) |
| Kontrak data | Backend FastAPI (`Backend/app/routers`, `schemas`) |
| Token desain | `@theme` di `frontend/app/globals.css` |
| Struktur file | `frontend/STRUCTURE.md` |

Tata letak tidak boleh dikarang. Kalau prototipe tidak mengatur sesuatu, tanyakan dulu atau tandai di laporan sebagai "tambahan di luar prototipe".

## 2. Lokasi file

```
frontend/
  app/                      route saja: ambil data, susun komponen
    (public)/               situs publik
    (private)/(admin)/      panel admin
    (private)/(auth)/       login
  components/
    ui/                     primitif: Button, Badge, Input, Select, Checkbox, FormField
    layout/                 Container, Section, PageHeader, StateBox, Skeleton
    public/                 kerangka publik: SiteHeader, SiteFooter, PublicImage
    admin/shell/            AdminShell, AdminSidebar, Topbar
    admin/shared/           Can, RequirePermission, Drawer/FormDialog, ConfirmDialog, Toast, Pager
  features/<domain>/        auth, news, programs, organization, settings, accounts, activity, dashboard
    public-api.ts           fungsi API publik
    admin-api.ts            fungsi API admin
    types.ts                tipe domain
    <helper>.ts             logika murni (status, format, tree)
    components/public/      komponen publik domain ini
    components/admin/       komponen admin domain ini
  lib/                      api (apiFetch, errors), media, utilitas umum
```

Arah ketergantungan hanya boleh ke bawah: `app` → `features` → `components` → `lib`. Satu `features/<domain>` tidak boleh mengimpor komponen dari domain lain; kalau dipakai bersama, pindahkan ke `components/`.

## 3. Styling (Tailwind v4)

### 3.1 `globals.css` hanya berisi empat hal

1. `@import "tailwindcss";`
2. Variabel token (`:root`, `.public-site`, `.admin-theme`), hanya deklarasi `--nama: nilai`.
3. `@theme inline { … }`: pemetaan token ke utility (warna, font, ukuran teks, breakpoint, keyframes animasi).
4. `@layer base { … }`: reset elemen minimal. **Tidak boleh ada aturan elemen di luar `@layer base`**, karena CSS di luar layer selalu mengalahkan utility. Itulah penyebab bug foto hero.

Dilarang: class komponen (`.btn`, `.card`, `.structure-*`), `@apply`, dan selector baru di luar keempat bagian tersebut.

### 3.2 Token

- **Warna:** pakai nama token (`bg-mint`, `text-green-900`, `border-line`), bukan hex di komponen. Warna baru dari prototipe ditambahkan ke token terlebih dahulu.
- **Ukuran teks dan nilai berulang:** jadikan token kalau dipakai **dua kali atau lebih**, atau kalau berasal dari variabel prototipe. Contohnya `--text-label` (12px, label kapital), `--text-sec-title` (clamp 26–34px), `--text-page-title` (clamp 32–44px), `--spacing-header` (72px).
- **Nilai arbitrer** (`pt-[110px]`) hanya boleh untuk nilai yang muncul sekali di prototipe. Kalau muncul lagi, pindahkan ke token.
- **Style inline** hanya boleh untuk nilai yang benar-benar dinamis dari data (misalnya `objectPosition` dari pengaturan), dan diberi komentar.

### 3.3 Breakpoint mengikuti prototipe, ditulis mobile-first

| Token | Nilai | Asal |
|---|---|---|
| `tab:` | `min-width: 641px` | publik dan admin `@media (max-width: 640px)` |
| `nav:` | `min-width: 901px` | admin `@media (max-width: 900px)` (sidebar) |
| `desk:` | `min-width: 961px` | publik `@media (max-width: 960px)` |
| `wide:` | `min-width: 1101px` | admin `@media (max-width: 1100px)` |

Gaya dasar ditulis untuk mobile, lalu ditambah ke atas: `grid-cols-1 tab:grid-cols-[160px_1fr_140px]`. Breakpoint bawaan Tailwind (`sm`, `md`, `lg`, `xl`) dan `max-[…]:` **tidak dipakai**.

### 3.4 Varian dan penggabungan class

- Varian komponen ditulis sebagai objek peta di file komponen itu sendiri:
  ```ts
  const variants = { solid: "bg-green-800 text-white hover:bg-green-700", outline: "…" } as const;
  ```
- Class dari luar digabung lewat helper `cn()` di `lib/cn.ts`. Kalau `clsx` dan `tailwind-merge` sudah disetujui untuk dipasang, helper itu memakai keduanya.
- Urutan class dirapikan otomatis oleh Prettier + `prettier-plugin-tailwindcss`. Tidak perlu diurutkan manual.

### 3.5 Dua tema

- Situs publik dibungkus `.public-site`, admin dan login dibungkus `.admin-theme`. Keduanya hanya mengganti nilai token, sedangkan nama utility tetap sama.
- Font: Literata (judul) dan Inter (isi) untuk keduanya, sesuai prototipe.

## 4. Komponen

- **Markup yang sama muncul dua kali → jadikan komponen.** Contoh: baris program di beranda dan `/program`; baris berita di beranda dan `/publikasi`.
- Komponen `ui/` dan `layout/` tidak mengambil data dan tidak tahu soal domain. Teks dan data masuk lewat props.
- Logika (pengelompokan tier struktur, normalisasi status, format tanggal) ditulis di fungsi murni `features/<domain>/*.ts`, bukan di JSX.
- **Server Component secara default.** `"use client"` hanya untuk bagian yang interaktif, dan dibuat sekecil mungkin. Misalnya hanya input pencarian yang menjadi client component, bukan seluruh halaman.
- Satu komponen satu file; nama file PascalCase sesuai nama komponen. Batas lunak 200 baris; kalau lebih, pecah.
- Ikon dari `lucide-react`.

## 5. Data dan API

- Semua request lewat `apiFetch` (`lib/api`): CSRF, cookie, dan `ApiError` sudah ditangani di sana. Jangan memanggil `fetch` mentah ke backend.
- Satu fungsi per endpoint, ditaruh di `features/<domain>/public-api.ts` atau `admin-api.ts`, dengan tipe respons yang eksplisit.
- Tipe mengikuti skema backend. Target: tipe dibuat otomatis dari OpenAPI FastAPI (`openapi-typescript`) supaya tidak ada yang ketinggalan saat backend berubah.
- Pesan galat untuk pengguna diambil lewat `getApiErrorMessage`. Detail teknis tidak ditampilkan.
- **Setiap tampilan data punya empat state:** memuat (skeleton sesuai prototipe), kosong, galat (dengan "Coba lagi"), dan berisi. Teks state diambil dari prototipe.
- **Cache halaman publik:** ISR dengan `revalidate`, ditambah `revalidateTag` setiap kali admin menyimpan perubahan. `force-dynamic` hanya dipakai kalau ada alasan tertulis.

## 6. SEO

- Root layout: `metadataBase`, template judul, `lang="id"`.
- Setiap halaman publik punya `metadata` atau `generateMetadata` (judul, deskripsi, canonical). Halaman detail juga punya OpenGraph image.
- `sitemap.ts` memuat semua route publik termasuk slug program dan berita. `robots.ts` memblokir `/admin` dan `/login`. Halaman admin diberi `noindex`.
- JSON-LD: `Organization` di beranda, `NewsArticle` di detail berita.
- Gambar memakai `next/image` dengan `remotePatterns` untuk domain API/Blob dan `sizes` yang benar. Foto hero diberi `priority`.
- Setiap halaman punya tepat satu `h1`, urutan heading tidak melompat, dan alt text bermakna (dekoratif → `alt=""`).

## 7. Aksesibilitas (minimum)

- Semua interaksi bisa dipakai dengan keyboard; fokus terlihat (outline token green-700).
- Dialog dan drawer: fokus terjebak di dalam, Escape menutup, fokus kembali ke pemicu.
- Kontras teks mengikuti token prototipe; jangan menurunkan opacity teks di luar nilai prototipe.
- Hormati `prefers-reduced-motion`.

## 8. Kesesuaian dengan desain

Setiap batch UI wajib:
1. Menyebut file, fungsi `app.js`, dan selector CSS prototipe yang diacu.
2. Menerjemahkan **semua properti** selector, termasuk media query.
3. Melampirkan **tabel pemetaan** di laporan: selector prototipe → komponen → class Tailwind, ditambah selisih yang disengaja beserta alasannya.
4. Dicek di browser pada lebar **375px** dan **1440px** (admin juga **900px**), berdampingan dengan file prototipe.

## 9. Git dan alur kerja

- Satu branch kerja: `feat/admin-ui-foundation`, lalu merge ke `main` lewat PR. Jangan membuat branch lain.
- Commit memakai format conventional: `feat(frontend): …`, `fix(frontend): …`, `refactor(frontend): …`, `chore: …`.
- Jangan pernah commit `.env*`, dump `.sql`, atau CSV berisi nama anggota (repo publik).
- OpenCode tidak boleh: commit, push, deploy, membaca `.env*`, menulis ke database, atau memasang package tanpa izin. Selalu mulai dengan `git status` dan tidak menimpa perubahan lokal.
- CI (GitHub Actions) menjalankan lint, `tsc`, dan build di setiap PR ke `main`.

## 10. Checklist selesai

- [ ] Sesuai prototipe di 375px dan 1440px (admin juga 900px)
- [ ] Tidak ada class komponen, `@apply`, atau aturan di luar layer di `globals.css`
- [ ] Tidak ada `max-[…]:` atau breakpoint bawaan; nilai berulang sudah jadi token
- [ ] Empat state data tersedia
- [ ] Metadata halaman ada (publik); `noindex` (admin)
- [ ] Bisa dipakai dengan keyboard
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run build` lulus (dan `pytest` bila backend disentuh)
- [ ] `frontend/STRUCTURE.md` dan `docs/progress.md` diperbarui bila ada file atau route baru

## Utang teknis (per 20 Nov 2026)

| Utang | Rencana |
|---|---|
| Sekitar 60 class lama dan aturan elemen di luar layer di `globals.css` | D-STRUKTUR (bagian 3b) |
| 107 nilai `px` arbitrer, 40 `max-[640px]:`, breakpoint `lg:` di admin | FE-BASE |
| Belum ada Prettier + plugin Tailwind, belum ada CI | FE-BASE |
| `<img>` biasa di hero dan berita, belum `next/image` | Batch SEO |
| Halaman publik `force-dynamic`, belum ISR + revalidate | Batch SEO |
| Sitemap belum memuat program dan berita | Batch SEO (setelah D-PUB) |
| Tipe API ditulis manual | Batch SEO atau setelah admin selesai |