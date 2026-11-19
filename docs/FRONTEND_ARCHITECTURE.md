# Panduan Arsitektur Frontend dan Atomic Design

## 1. Prinsip utama

Struktur folder di bawah adalah **target organisasi bertahap**, bukan perintah memindahkan seluruh source sekaligus. Sebelum membuat folder atau memindahkan komponen, pelajari struktur lokal dan pertahankan pola yang sudah berjalan. Pindahkan/refactor hanya jika diperlukan untuk task konkret dan seluruh import/route tetap terverifikasi.

Target praktis:

```text
frontend/
├── app/                         # Next.js routes/layouts; halaman merakit feature/UI
├── components/
│   ├── ui/                      # primitive lintas fitur
│   ├── layout/                  # shell/layout lintas route, bila memang shared
│   ├── public/                  # komponen khusus public site
│   ├── admin/                   # komponen khusus admin
│   │   └── shared/              # pola shared admin yang sudah ada; reuse
│   └── shared/                  # komponen lintas public/admin bila benar-benar sama
├── features/                    # opsional; domain kompleks yang sudah layak dipisah
│   └── <domain>/                # komponen, hooks, tipe view/domain khusus
├── lib/
│   ├── api/                     # client/request/error handling umum bila belum ada
│   ├── public/                  # service/adapter public yang sudah ada
│   └── admin/                   # service/adapter admin yang sudah ada
├── types/                       # tipe bersama yang memang digunakan di beberapa tempat
└── styles/                      # token atau style bersama bila cocok dengan setup existing
```

Jangan memaksakan folder `features/` jika pola `components/admin`, `components/public`, `lib/admin`, atau `lib/public` saat ini masih jelas dan lebih sederhana. Konsistensi dan perubahan incremental lebih penting daripada mengikuti diagram ini secara literal.

## 2. Pembagian lapisan

### Route/page — `app/`

- Menangani routing, metadata, layout route, dan komposisi feature.
- Hindari menjadikan file page ratusan baris yang mencampur network handling, transform data, form state, dan semua detail visual.
- Jangan menambahkan route hanya karena nama halaman ada di mockup; cocokkan backend support serta scope.

### UI primitives — `components/ui/`

Kandidat atom ketika dibutuhkan:
- `Button`, `IconButton`;
- `Input`, `Select`, `Textarea`, `Label`;
- `Badge`/`StatusBadge`;
- `Spinner`, `Skeleton`;
- primitive lain yang benar-benar konsisten pemakaiannya.

Aturan:
- Komponen UI harus punya API props yang jelas, tipe TypeScript, focus/disabled/loading state relevan, dan tidak memiliki ketergantungan pada data domain.
- Jangan menyamakan semua tombol menjadi satu style jika reference membutuhkan variasi `primary`, `secondary`, `outline`, dan `danger`.
- File yang kosong adalah placeholder, bukan implementasi. Baseline remote yang terakhir diperiksa memiliki `Button.tsx`, `FormField.tsx`, `Input.tsx`, dan `Select.tsx` yang kosong; cek kondisi lokal. Jika ingin menggunakan, implementasikan dengan scope jelas atau cari komponen existing yang benar.

### Molecules — gabungan elemen yang punya perilaku

Contoh: `FormField` (label + control + help/error), search field, filter bar, pagination controls, field group, atau status indicator yang terdiri dari beberapa primitive.

Jangan mengubah tiap kombinasi kecil menjadi komponen terpisah tanpa reuse atau kebutuhan pengujian yang nyata.

### Organisms/feature components — area UI berfungsi lengkap

Contoh: admin sidebar/topbar, page header dengan actions, table data, dialog form, organization chart, public news list/detail.

Komponen domain boleh tahu konsep program/news/member, tetapi sebaiknya tidak membuat request dengan kontrak yang diduplikasi di dalamnya. Gunakan API service/adapter yang sesuai.

### Domain/API service — `lib/` atau lokasi existing

- Periksa client/adapter yang sudah ada sebelum menambah client lain.
- Endpoint/request, parsing response, error mapping dan tipe API harus memiliki tempat yang dapat ditemukan.
- Jangan mencampur tipe response mentah dengan tipe untuk rendering jika normalisasi diperlukan.
- Jangan memindahkan semua service hanya untuk membuat arsitektur tampak baru.

## 3. Aturan reuse

- Reuse jika komponen memang dipakai di beberapa tempat atau satu primitive memiliki standar visual/interaksi yang harus konsisten.
- Jangan membangun “generic component framework” untuk kebutuhan yang baru sekali muncul.
- Hindari props yang terlalu banyak dan kombinasi boolean yang tidak jelas. Pisahkan varian yang bermakna.
- Jika dua komponen mirip tapi berbeda konteks public/admin, pertimbangkan shared primitive untuk dasar, tetapi biarkan wrapper/domain component menangani kebutuhan spesifik.
- Jangan melakukan refactor besar bersamaan dengan penyesuaian desain halaman kecuali diperlukan dan disetujui.

## 4. Komponen existing yang harus dicek sebelum membuat ulang

Baseline audit remote (snapshot 2026-10-27) menunjukkan:
- `frontend/components/admin/shared/FormDialog.tsx` sudah ada dan digunakan oleh `ProgramFormDialog.tsx`.
- `frontend/components/admin/shared/ConfirmDialog.tsx` sudah ada dan digunakan oleh `ProgramDeleteDialog.tsx`.
- `AdminShell.tsx` dan `AdminSidebar.tsx` sudah menangani sebagian perilaku navigasi mobile.
- `frontend/lib/admin/` dan `frontend/lib/public/` sudah menjadi lokasi service/adapter domain.

Verifikasi source lokal. Jangan membuat dialog, navigation shell, atau API layer duplikat tanpa alasan teknis yang jelas.

## 5. Strategi perubahan bertahap

Urutan yang disarankan:
1. Audit route/layout/component/API client yang ada dan file kosong/duplikat.
2. Tetapkan token visual dan primitive paling penting berdasarkan design references.
3. Terapkan primitive pada satu area representative terlebih dahulu.
4. Implementasikan atau rapikan molecule/organism yang dipakai di area tersebut.
5. Perbarui feature/API mapping secara terpisah dari backend.
6. Perluas ke halaman lain sesudah hasil lint/build dan visual state diperiksa.
7. Hindari mengganti struktur folder keseluruhan sampai ada alasan yang terbukti dari kebutuhan implementasi.

## 6. Pemeriksaan teknis

Dari `frontend/package.json` pada snapshot remote, script yang ada adalah `dev`, `build`, `start`, `lint`; tidak ada script `test` atau `typecheck` pada manifest tersebut saat diperiksa. Verifikasi ulang di lokal.

- Jalankan `npm run lint` untuk perubahan yang relevan.
- Jalankan `npm run build` untuk batch UI/API yang signifikan bila lingkungan dan konfigurasi memungkinkan.
- Jika lint/build gagal karena masalah existing atau environment, laporkan error aktual; pisahkan dari regresi yang berasal dari patch.
- Jangan mengubah dependency atau toolchain untuk menyembunyikan error tanpa investigasi terlebih dahulu.
