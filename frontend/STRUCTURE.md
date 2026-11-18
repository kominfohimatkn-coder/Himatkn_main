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
│   │   ├── PublicButton.tsx
│   │   ├── PublicImage.tsx
│   │   ├── PublicLabel.tsx
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
│   │   └── types.ts
│   ├── auth/
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── permissions.ts
│   │   └── AuthContext.tsx
│   ├── dashboard/
│   │   └── admin-api.ts
│   ├── news/
│   │   ├── admin-api.ts
│   │   ├── public-api.ts
│   │   ├── types.ts
│   │   └── components/
│   │       ├── admin/            # NewsList, NewsOverlays, NewsPrimitives
│   │       └── public/           # PublicationsSection
│   ├── organization/
│   │   ├── admin-api.ts
│   │   ├── public-api.ts
│   │   ├── types.ts
│   │   └── components/           # OrganizationSection, StructureDirectory, StructurePage
│   ├── programs/
│   │   ├── admin-api.ts
│   │   ├── public-api.ts
│   │   ├── types.ts
│   │   ├── status.ts
│   │   └── components/
│   │       └── admin/            # ProgramDeleteDialog, ProgramFormDialog, ProgramPrimitives, ProgramsList
│   ├── settings/
│   │   ├── admin-api.ts
│   │   ├── public-api.ts
│   │   ├── types.ts
│   │   └── links.ts
│   └── visits/
│       └── public-api.ts
└── lib/
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

## Yang tetap di `lib/` dan `components/` (shared)

- `lib/api/client.ts` dan `lib/api/errors.ts`: infrastruktur HTTP/error yang
  dipakai semua fitur.
- `lib/media/`: utilitas media bersama (`api.ts`, `compress.ts`, `types.ts`).
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

## Catatan batch wiring

`features/settings/links.ts` masih berisi konstanta `PUBLIC_LINKS`. Pada batch
wiring, sumber tautan publik akan diganti dengan `getPublicLinks(settings)`.
