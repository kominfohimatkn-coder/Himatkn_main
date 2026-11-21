# Struktur Frontend

Dokumen ini menjelaskan pembagian folder `frontend/` setelah batch FE-S
(pemindahan kode per domain ke `features/`). Tidak ada barrel `index.ts`;
setiap file diimpor langsung dari path aslinya.

## Pohon folder

```
frontend/
├── app/                          # Route Next.js (isi tetap; hanya import diperbarui)
├── components/
│   ├── admin/
│   │   ├── shell/                # AdminShell, AdminSidebar, admin-navigation
│   │   └── shared/               # Can, RequirePermission, ConfirmDialog, FormDialog
│   ├── public/                   # Komponen publik lintas fitur
│   │   ├── HighlightedText.tsx
│   │   ├── PlainTextBody.tsx
│   │   ├── PublicButton.tsx
│   │   ├── PublicHeroImage.tsx
│   │   ├── PublicImage.tsx
│   │   ├── PublicLabel.tsx
│   │   ├── PublicSearch.tsx
│   │   ├── PublicStateBox.tsx
│   │   ├── RefreshButton.tsx
│   │   ├── SiteFooter.tsx
│   │   └── SiteHeader.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Checkbox.tsx
│       ├── FormField.tsx
│       ├── Input.tsx
│       ├── Select.tsx
│       └── Textarea.tsx
├── features/
│   ├── accounts/
│   │   ├── api.ts
│   │   ├── format.ts
│   │   ├── permissions.ts
│   │   ├── types.ts
│   │   └── components/
│   │       └── admin/            # AccountsList, AccountFormDialog, PermissionChecklist,
│   │                             # AccountPasswordResetDialog, AccountDeleteDialog,
│   │                             # AccountsPrimitives
│   ├── auth/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── permissions.ts
│   │   ├── AuthContext.tsx
│   │   └── components/           # ChangePasswordForm
│   ├── dashboard/
│   │   └── admin-api.ts
│   ├── news/
│   │   ├── admin-api.ts
│   │   ├── public-api.ts
│   │   ├── types.ts
│   │   ├── format.ts             # tanggal, cover, galeri, excerpt
│   │   ├── content.tsx           # body teks polos (Markdown menyusul)
│   │   └── components/
│   │       ├── admin/            # NewsList, NewsOverlays, NewsPrimitives
│   │       └── public/           # PublicationsSection, NewsList
│   ├── organization/
│   │   ├── admin-api.ts
│   │   ├── public-api.ts
│   │   ├── types.ts
│   │   └── components/
│   │       ├── admin/            # PeriodToolbar, PeriodFormDialog, PeriodActivateDialog,
│   │       │                     # PeriodChecklist, DivisionsSection, DivisionFormDialog,
│   │       │                     # DivisionCopyDialog, DivisionDeleteDialog, OrganizationPrimitives,
│   │       │                     # MembersSection, MemberFormDialog, MemberPhotoField,
│   │       │                     # MemberAvatar, MemberDeleteDialog
│   │       ├── OrganizationSection.tsx
│   │       ├── StructureDirectory.tsx
│   │       └── StructurePage.tsx
│   ├── programs/
│   │   ├── admin-api.ts
│   │   ├── public-api.ts
│   │   ├── types.ts
│   │   ├── status.ts
│   │   └── components/
│   │       ├── admin/            # ProgramDeleteDialog, ProgramFormDialog, ProgramPrimitives, ProgramsList
│   │       └── public/           # ProgramList, ProgramStatusBadge
│   ├── settings/
│   │   ├── admin-api.ts
│   │   ├── public-api.ts
│   │   ├── fallback.ts
│   │   ├── types.ts
│   │   ├── links.ts
│   │   └── components/
│   │       └── admin/            # SettingsGroupNav, SettingsGroupForm, SettingField,
│   │                             # HeroImageField, UnknownKeysPanel, SettingsPrimitives,
│   │                             # settings-utils
│   └── visits/
│       └── public-api.ts
└── lib/
    ├── format-date.ts            # formatDateShort / formatDateLong (YYYY-MM-DD)
    ├── api/
    │   ├── client.ts
    │   └── errors.ts
    └── media/
        ├── api.ts
        ├── compress.ts
        └── types.ts
```

## Arti folder `features/<domain>/`

Satu domain bisnis memiliki satu folder sendiri. Isi yang lazim:

| File | Isi |
|---|---|
| `admin-api.ts` | Pemanggilan API untuk area admin domain tersebut. |
| `public-api.ts` | Pemanggilan API untuk area publik domain tersebut. |
| `types.ts` | Tipe request/response dan tipe domain. |
| `components/admin/` | Komponen UI yang hanya dipakai halaman admin domain tersebut. |
| `components/public/` | Komponen UI yang hanya dipakai halaman publik domain tersebut. |

File khusus domain lain yang sudah ada sebelumnya dipertahankan namanya,
misalnya `features/auth/permissions.ts`, `features/auth/AuthContext.tsx`,
`features/programs/status.ts`, dan `features/settings/links.ts`.

Halaman admin struktur organisasi merangkai komponen di
`features/organization/components/admin/` (periode, divisi, salin divisi,
anggota, foto anggota) dan memakai `features/organization/admin-api.ts` sebagai
satu-satunya jalur pemanggilan API. Pesan error API diambil dari `ApiError` lewat
`getApiErrorMessage` di `lib/api/errors.ts`.

Halaman `/admin/accounts` (khusus superadmin) merangkai komponen di
`features/accounts/components/admin/` dan memakai `features/accounts/api.ts`
sebagai satu-satunya jalur API akun. Halaman `/admin/account` (semua akun yang
login) menampilkan profil dari `useAuth()` dan form ganti kata sandi di
`features/auth/components/ChangePasswordForm.tsx`. Halaman ini tidak memanggil
katalog izin karena katalog hanya tersedia untuk superadmin.

Foto anggota disimpan sebagai `storage_key` hasil `uploadImage()`
(`POST /media/images`) di `photo_url`. Pratinjau menormalkan storage key dengan
`mediaPathFromStorageKey()` lalu `resolveMediaUrl()`; nilai lama berupa URL atau
path tetap ditampilkan lewat `resolveMediaUrl()`. Pencarian anggota dilakukan di
sisi klien dan tidak menambah parameter API.

Halaman `/admin/settings` merangkai komponen di
`features/settings/components/admin/`. `settings-utils.ts` menjadi satu tempat
untuk urutan/label grup (mengikuti `group` dari backend), hint per key, dan
validasi ringan klien (email, `https://`, host yang diizinkan); validasi akhir
tetap backend, dan error `422` per key dari `ApiError.errors` ditampilkan pada
field terkait. Setiap grup disimpan terpisah lewat
`patchAdminSettings()` dengan hanya key yang berubah; `deleteAdminSetting()`
dipakai untuk reset per field dan pembersihan `unknown_keys`. Foto hero memakai
alur yang sama dengan foto anggota: `uploadImage()` menyimpan `storage_key` ke
`hero_image`, pratinjau memakai `preview_url` backend atau
`mediaPathFromStorageKey()` + `resolveMediaUrl()`, dan tanpa `media.manage`
area unggah diganti pemberitahuan.

## Yang tetap di `lib/` dan `components/` (shared)

- `lib/api/client.ts` dan `lib/api/errors.ts`: infrastruktur HTTP/error yang
  dipakai semua fitur. `getApiErrorMessage(error, fallback)` adalah helper
  standar untuk mengambil pesan aman dari `ApiError` (memprioritaskan
  `detail` backend) dan dipakai lintas fitur.
- `lib/media/`: utilitas media bersama (`api.ts`, `compress.ts`, `types.ts`).
- `lib/format-date.ts`: `formatDateShort` ("7 Mar 2026") dan `formatDateLong`
  ("7 Maret 2026") untuk tanggal `YYYY-MM-DD`; helper
  `features/news/format.ts` memotong datetime API menjadi bagian tanggal lalu
  memanggil helper ini.
- `components/ui/`: primitif UI umum (`Button`, `Input`, `Textarea`,
  `Select`, `Checkbox`, `FormField`).
- `components/admin/shell/` dan `components/admin/shared/`: kerangka admin,
  dialog bersama, dan gerbang izin (`Can`, `RequirePermission`).
- `components/public/`: komponen publik yang dipakai lebih dari satu fitur.
- `app/`: route Next.js. Route hanya merangkai fitur; logika domain berada di
  `features/`.

Komponen yang hanya dipakai satu fitur harus tinggal di folder fitur itu,
bukan di `components/`.

## Aturan import

1. Di dalam satu fitur, gunakan path relatif:
   - `./types`, `./api`, `../types`, `../../status`, dan sejenisnya.
2. Lintas fitur atau ke kode shared, gunakan alias `@/`:
   - `@/lib/api/client`
   - `@/lib/media/compress`
   - `@/components/ui/Button`
   - `@/features/auth/types`
   - `@/features/organization/admin-api`
3. Jangan membuat file barrel `index.ts` dan jangan mengubah urutan ekspor hanya
   demi pemindahan file.

## Komponen form dan gerbang izin

Primitif form di `components/ui/` meneruskan `ref` (React 19: `ref` sebagai
prop biasa) dan seluruh props native elemennya:

| Komponen | Props tambahan | Catatan |
|---|---|---|
| `Input` | `invalid?: boolean` | Border `danger` + `aria-invalid`. |
| `Textarea` | `invalid?: boolean` | `rows` default 4, resize vertikal. |
| `Select` | `invalid?: boolean`, `placeholder?: string` | `<select>` native; placeholder dirender sebagai `<option value="" disabled>`. Panah memakai SVG inline. |
| `Checkbox` | `label`, `description?` | Label membungkus input sehingga seluruh area teks dapat diklik. |
| `FormField` | `label`, `hint?`, `error?`, `required?`, `id?` | Membungkus satu kontrol form. |

`FormField` memakai `useId` bila `id` tidak diberikan, lalu menghubungkan
`htmlFor`/`id`, `aria-describedby` ke hint/error, menandai wajib, dan
menampilkan error dengan `role="alert"`. Pola penghubungnya adalah
`cloneElement`: anak harus satu elemen kontrol form (`Input`, `Textarea`,
`Select`, atau `Checkbox`). `FormField` menyuntikkan `id`, `required`,
`aria-describedby`, dan `aria-invalid` ke anak tersebut.

```tsx
<FormField label="Nama program" hint="Slug dibuat terpisah." required
  error={errors.name}>
  <Input
    name="name"
    value={name}
    onChange={(event) => setName(event.target.value)}
    invalid={Boolean(errors.name)}
  />
</FormField>
```

Gerbang izin memakai `useAuth()` dan konstanta `PERMISSIONS` dari
`features/auth/permissions.ts`; jangan menulis string izin manual:

- `components/admin/shared/Can.tsx` — menyembunyikan elemen (misalnya tombol)
  bila izin tidak ada. Props: `permission`, `anyOf`, `fallback`, `children`.
- `components/admin/shared/RequirePermission.tsx` — membungkus halaman. Props:
  `permission`, `anyOf`, `superadminOnly`, `children`. Saat auth masih memuat
  tampil state loading admin; bila tidak diizinkan tampil panel "Anda tidak
  memiliki akses ke halaman ini" dan tombol kembali ke Dashboard (tanpa
  redirect otomatis).

```tsx
<RequirePermission permission={PERMISSIONS.PROGRAMS_VIEW}>
  <ProgramsPageContent />
</RequirePermission>

<Can permission={PERMISSIONS.PROGRAMS_MANAGE}>
  <button type="button">Tambah program</button>
</Can>
```

Gerbang ini hanya untuk tampilan. Backend tetap penentu akhir dan dapat
mengembalikan 403.

## Pengaturan situs dan tautan publik

Pengaturan situs dimuat **di Server Component** (layout atau page), bukan di
komponen klien. `app/(public)/layout.tsx` memanggil `loadPublicSettings()` sekali,
menggabungkannya dengan `PUBLIC_SETTINGS_FALLBACK` lewat
`resolvePublicSettings()`, lalu mengoper nilai efektif ke `SiteHeader` dan
`SiteFooter` sebagai props. Halaman yang butuh copy tambahan (beranda,
`/struktur`) memanggil helper yang sama; fetch Next.js akan melakukan dedupe
untuk request yang sama. Bila API gagal, resolver memakai fallback sehingga
halaman tetap tampil.

`features/settings/links.ts` mengekspor `getPublicLinks(settings)` yang
mengembalikan `{ bankSoal, instagram }`. Setiap tautan bernilai `null` bila URL
di setting kosong, sehingga pemanggil menyembunyikan elemennya (tidak memakai
URL hardcoded). Label Instagram memakai `instagram_label` dengan teks netral
"Instagram"; kedua tautan memakai `target="_blank"` dan
`rel="noopener noreferrer"`.

Foto hero memakai `PublicHeroImage` (komponen klien kecil): nilai `hero_image`
dari setting diubah lewat `resolveMediaUrl()`; bila kosong atau gagal dimuat,
komponen jatuh ke aset statis `/images/hero-group.jpg`.

## Chrome publik, beranda, dan daftar (Batch D-HOME, D-PUB)

`app/(public)/layout.tsx` tetap menjadi satu-satunya tempat pemuatan settings
untuk chrome publik. Batch D-HOME dan D-PUB hanya mengubah tampilan; data tetap
mengalir dari server component. Detail rute `/program` dan `/publikasi` ada di
bagian "Halaman publik" di bawah.

- `SiteHeader` (Client Component) menerima `brandName`, `brandSubtitle`,
  `bankSoal`, dan `instagram`. Urutan navigasi desktop dan mobile: Beranda,
  Tentang, Kegiatan (`/program`), Publikasi (`/publikasi`), Bank Soal (hanya bila
  `bankSoal` tidak `null`), lalu Struktur. Status aktif dihitung dari prefix
  pathname, sehingga `/program/*` menandai Kegiatan dan `/publikasi/*` menandai
  Publikasi. Tombol Instagram hanya muncul di menu mobile bila `instagram` tidak
  `null`. Tombol menu memakai tiga garis beranimasi; panel menutup lewat Escape,
  klik di luar, atau tautan, dengan focus trap sederhana dan scroll body terkunci.
- `SiteFooter` (Server Component) menerima `brandName`, `brandSubtitle`,
  `footerCopyright`, `footerInstitution`, `mapsUrl`, `mapsEmbedUrl`, dan
  `address`. Footer memakai teks brand tanpa logo, nav Beranda/Tentang/Kegiatan
  (`/program`)/Berita (`/publikasi`)/Struktur, peta dari `mapsEmbedUrl` (dengan
  `loading="lazy"` dan `referrerPolicy="no-referrer-when-downgrade"`), tautan
  "Buka Google Maps" dari `mapsUrl`, serta fallback alamat `address` bila embed
  kosong. Baris copyright dan institusi hanya dirender bila nilainya terisi.
- `PublicationsSection` menerima `items`, `hasError`, `eyebrow`, `title`,
  `emptyText`, dan `instagram`. Section memakai `id="publikasi"` dan merender
  maksimal dua publikasi lewat `NewsList` bersama: cover (atau kotak "Foto"),
  judul, excerpt ±150 karakter, tanggal pendek, dan tautan baca ke
  `/publikasi/<slug>`. Di bawah daftar ada tombol "Lihat Semua Publikasi →" ke
  `/publikasi` (`.sec-foot`), dan state kosong menawarkan tautan Instagram.
- `NewsList` (`features/news/components/public/NewsList.tsx`) dipakai beranda
  dan `/publikasi`: baris `.pub` satu kolom di mobile (gap 14px, cover 180px)
  dan dua kolom sejak 641px, dengan `<mark>` dari `HighlightedText` saat ada
  kata kunci.
- `OrganizationSection` menerima `data`, `hasError`, `eyebrow`, `title`,
  `description`, `note`, dan `buttonLabel`. Section memakai `id="kepengurusan"`
  bergaya gelap, kartu divisi dua kolom di desktop, statistik periode/divisi di
  mobile, kartu tautan `/struktur?view=semua` bila jumlah divisi ganjil, dan
  tombol "Selengkapnya" ke `/struktur`.

## Halaman publik

- `/program` dan `/program/[slug]` (Batch D-PUB Fase A) memakai
  `features/programs/public-api.ts`. Daftar mengambil `limit: 50` lalu memfilter
  status dan kata kunci di server component berdasarkan `searchParams`; kartu
  barisnya berasal dari `features/programs/components/public/ProgramList.tsx`
  yang juga dipakai beranda. Label status selalu dari `programStatusLabel`.
- `/publikasi` dan `/publikasi/[slug]` (Batch D-PUB Fase B) memakai
  `features/news/public-api.ts`. Daftar mengirim `q` ke backend hanya bila
  panjangnya ≥ 2 karakter, memakai pagination `?page=` 10 item per halaman, dan
  menghitung `totalPages` dari `total`. Detail merender cover 16:9, tag, isi teks
  polos lewat `features/news/content.tsx`, dan galeri; slug yang tidak ada
  memanggil `notFound()`.
- Pencarian pada kedua daftar memakai `components/public/PublicSearch.tsx`
  (debounce, memperbarui `?q=`), dan setiap hasil menyorot kata kunci dengan
  `HighlightedText`.
- Kedua daftar punya `loading.tsx` masing-masing dengan skeleton yang meniru
  ukuran konten akhir; detail publikasi menyertakan skeleton cover 16:9,
  sedangkan detail program tidak karena program tidak punya gambar.
