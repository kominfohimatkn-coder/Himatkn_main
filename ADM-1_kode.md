# ADM-1 — Fondasi tampilan admin (kode salin-tempel)

Basis: `feat/admin-ui-foundation` commit `3a0ac8f`. Tidak ada file yang dihapus. Tailwind v4 utility; di `globals.css` hanya token dan pemindahan `:focus-visible` ke `@layer base`.

Lint dan `tsc` lulus. Diuji dengan build produksi + API tiruan: login, dashboard, sidebar (desktop & ponsel), menu akun, panel geser (FormDialog), dialog hapus (ConfirmDialog).

## Urutan
1. Bagian A: ubah `frontend/app/globals.css` (3 tempat).
2. Bagian B: buat 7 file baru.
3. Bagian C: ganti seluruh isi 15 file.
4. Dari folder `frontend`: `npm run lint`, `npx tsc --noEmit`, `npm run build`.

## A. `frontend/app/globals.css`

### A1. Di dalam `@theme inline { ... }`, cari:
```css
  --color-amber: var(--amber);

  /* Status */
```
ganti dengan:
```css
  --color-amber: var(--amber);

  /* Panel admin — nilai aktual di-scope pada .admin-theme */
  --color-green-600: var(--green-600);
  --color-mint-50: var(--mint-50);
  --color-line-strong: var(--line-strong);
  --color-muted-light: var(--muted-light);
  --color-on-dark-muted: var(--on-dark-muted);
  --color-amber-bg: var(--amber-bg);
  --color-danger-bg: var(--danger-bg);
  --color-info: var(--info);
  --color-info-bg: var(--info-bg);

  /* Status */
```

### A2. Ganti seluruh blok `.admin-theme { ... }` (yang sekarang hanya berisi 4 baris font + `font-family`) dengan:
```css
.admin-theme {
  /* Palet Design/admin/assets/admin.css (:root). */
  --green-950: #06261b;
  --green-900: #0b2a1f;
  --green-800: #0f4d36;
  --green-700: #1e5a43;
  --green-600: #2c6e55;
  --mint: #e3eee8;
  --mint-50: #f1f6f3;
  --white: #ffffff;
  --ink: #13201a;
  --muted: #5b6863;
  --muted-light: #66726c;
  --line: #dce4e0;
  --line-strong: #c9d4ce;
  --line-on-dark: #1c3d31;
  --on-dark-muted: #a7b8b0;
  --amber: #b07a18;
  --amber-bg: #fbf3e3;
  --danger: #a33a22;
  --danger-bg: #fcf1ee;
  --info: #2b4f8f;
  --info-bg: #eef2fa;
  --warning: #b07a18;
  --success: #1e5a43;
  --radius: 4px;

  /* Token lama dipetakan ke palet admin agar halaman yang belum
     dirombak ikut berwarna hijau-mint (dibersihkan di batch ADM-2..7). */
  --paper: #ffffff;
  --cream: #fbfdfc;
  --cream-2: #f1f6f3;
  --bg-light: #fbfdfc;
  --bg-light-2: #f1f6f3;
  --bg-dark: #06261b;
  --bg-dark-2: #0b2a1f;
  --gold: #b07a18;
  --gold-soft: #c48c26;
  --gold-ink: #8a5f12;
  --gold-bright: #e3eee8;
  --ink-soft: #5b6863;
  --on-dark: #ffffff;
  --on-dark-soft: #a7b8b0;
  --paper-line: #dce4e0;
  --line-dark: #dce4e0;
  --focus-ring: #1e5a43;

  /* Font admin mengikuti prototipe: Literata (judul) + Inter (isi). */
  --font-sans-stack: var(--font-inter), system-ui, sans-serif;
  --font-serif-stack: var(--font-literata), Georgia, serif;
  --font-sans: var(--font-sans-stack);
  --font-serif: var(--font-serif-stack);

  background: #fbfdfc;
  color: var(--ink);
  font-family: var(--font-sans-stack);
  font-size: 14px;
  line-height: 1.55;
}
```

### A3. Cari:
```css
:focus-visible {
  outline: 2px solid var(--focus-ring);
  outline-offset: 3px;
}
```
ganti dengan:
```css
@layer base {
  :focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 3px;
  }
}
```
Alasannya: aturan di luar layer mengalahkan class Tailwind, sehingga `outline-none` di input tidak berlaku.

## B. File baru (7)

### 1. `frontend/components/admin/shared/AdminPage.tsx`
```tsx
import type { ReactNode } from "react";

/**
 * Pembungkus isi halaman admin, mengikuti `.content` di Design/admin:
 * padding 32px 32px 64px, lebar maksimum 1240px (≤900px: 22px 16px 80px).
 */
export function AdminPage({ children }: { children: ReactNode }) {
  return (
    <div className="w-full max-w-[1240px] px-4 pt-[22px] pb-20 min-[901px]:px-8 min-[901px]:pt-8 min-[901px]:pb-16">
      {children}
    </div>
  );
}
```

### 2. `frontend/components/admin/shared/Badge.tsx`
```tsx
import type { ReactNode } from "react";

export type BadgeTone =
  | "green"
  | "mint"
  | "amber"
  | "grey"
  | "red"
  | "blue"
  | "outline";

/** `.badge` + `.badge--*` di Design/admin/assets/admin.css. */
const toneClasses: Record<BadgeTone, string> = {
  green: "border-transparent bg-green-800 text-white",
  mint: "border-transparent bg-mint text-green-900",
  amber: "border-amber bg-white text-amber",
  grey: "border-transparent bg-[#eef1ef] text-muted",
  red: "border-[#ebcfc6] bg-danger-bg text-danger",
  blue: "border-transparent bg-info-bg text-info",
  outline: "border-line-strong bg-white text-muted",
};

export function Badge({
  tone = "grey",
  dot = false,
  children,
}: {
  tone?: BadgeTone;
  /** `.badge--dot`: titik 6px sewarna teks. */
  dot?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-[23px] items-center gap-1.5 rounded-[3px] border px-[9px] text-[11px] leading-none font-semibold tracking-[0.08em] whitespace-nowrap uppercase ${toneClasses[tone]} ${
        dot ? "before:size-1.5 before:rounded-full before:bg-current" : ""
      }`}
    >
      {children}
    </span>
  );
}
```

### 3. `frontend/components/admin/shared/Card.tsx`
```tsx
import type { ReactNode } from "react";

/** Kartu admin, mengikuti `.card`, `.card__head`, `.card__body` di Design/admin. */
export function Card({
  title,
  action,
  children,
  bodyClassName = "",
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  /** Isi `p-5` (card__body). Kosongkan dengan "p-0" untuk tabel/daftar. */
  bodyClassName?: string;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[4px] border border-line bg-white ${className}`.trim()}
    >
      {title || action ? (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          {title ? (
            <h2 className="font-serif text-base leading-[1.25] font-bold text-green-900">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {action}
        </div>
      ) : null}

      <div className={bodyClassName || "p-5"}>{children}</div>
    </section>
  );
}
```

### 4. `frontend/components/admin/shared/PageHead.tsx`
```tsx
import type { ReactNode } from "react";

/** Kepala halaman admin, mengikuti `.page-head` di Design/admin/assets/admin.css. */
export function PageHead({
  label,
  title,
  description,
  actions,
}: {
  label?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-[26px] flex flex-wrap items-end justify-between gap-5">
      <div className="min-w-0">
        {label ? (
          <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-green-700 uppercase">
            {label}
          </p>
        ) : null}
        <h1 className="mt-2 font-serif text-2xl leading-[1.25] font-bold text-green-900 min-[641px]:text-[28px]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1.5 max-w-[62ch] text-muted">{description}</p>
        ) : null}
      </div>

      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
```

### 5. `frontend/components/admin/shared/StateBlock.tsx`
```tsx
import type { ReactNode } from "react";

/**
 * Blok state kosong/galat/terlarang, mengikuti `.state` + `stateBlock()`
 * di Design/admin. Dipakai di dalam Card atau berdiri sendiri.
 */
export function StateBlock({
  icon,
  label,
  title,
  children,
  action,
  tone = "default",
}: {
  icon: ReactNode;
  label?: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  tone?: "default" | "error";
}) {
  const isError = tone === "error";

  return (
    <div
      className="px-6 py-14 text-center"
      role={isError ? "alert" : "status"}
    >
      <div
        className={`mx-auto mb-4 grid size-[52px] place-items-center rounded-full [&_svg]:size-[22px] ${
          isError ? "bg-danger-bg text-danger" : "bg-mint text-green-800"
        }`}
        aria-hidden="true"
      >
        {icon}
      </div>

      {label ? (
        <p
          className={`text-[11px] leading-[1.2] font-semibold tracking-[0.1em] uppercase ${
            isError ? "text-danger" : "text-green-700"
          }`}
        >
          {label}
        </p>
      ) : null}

      <h3 className="mt-2 font-serif text-[19px] leading-[1.25] font-bold text-green-900">
        {title}
      </h3>

      {children ? (
        <p className="mx-auto mt-2 max-w-[46ch] text-muted">{children}</p>
      ) : null}

      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
```

### 6. `frontend/components/admin/shell/AdminTopbar.tsx`
```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ExternalLink, LogOut, Menu, UserRound } from "lucide-react";

import { useAuth } from "@/features/auth/AuthContext";

function initials(name: string): string {
  const parts = name.trim().split(/[\s._-]+/).filter(Boolean);
  const letters = parts.slice(0, 2).map((part) => part.charAt(0));
  return (letters.join("") || "A").toUpperCase();
}

/** `.topbar` + `.crumbs` + `.user` + `.dropdown` di Design/admin/assets/admin.css. */
export function AdminTopbar({
  title,
  menuOpen,
  onMenuOpen,
  menuButtonRef,
}: {
  title: string;
  menuOpen: boolean;
  onMenuOpen: () => void;
  menuButtonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const { admin, isSuperadmin, logout } = useAuth();
  const router = useRouter();
  const [userOpen, setUserOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userOpen) return;

    function handleClick(event: MouseEvent) {
      if (!userRef.current?.contains(event.target as Node)) {
        setUserOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setUserOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("keydown", handleKey);
    };
  }, [userOpen]);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
      router.replace("/login");
    } catch {
      setLogoutError("Logout gagal. Silakan coba lagi.");
    } finally {
      setIsLoggingOut(false);
    }
  }

  const username = admin?.username ?? "Admin";
  const roleLabel = isSuperadmin ? "Superadmin" : "Admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-line bg-[rgba(251,253,252,0.94)] px-4 backdrop-blur-[8px] min-[901px]:px-8">
      <button
        ref={menuButtonRef}
        type="button"
        onClick={onMenuOpen}
        aria-label="Buka navigasi"
        aria-expanded={menuOpen}
        aria-controls="admin-navigation"
        className="grid size-[38px] cursor-pointer place-items-center rounded-[4px] text-muted hover:bg-mint-50 hover:text-green-900 min-[901px]:hidden [&_svg]:size-[19px]"
      >
        <Menu aria-hidden="true" />
      </button>

      <nav
        aria-label="Breadcrumb"
        className="flex min-w-0 items-center gap-2 text-xs text-muted"
      >
        <Link
          href="/admin/dashboard"
          className="text-muted no-underline hover:text-green-800"
        >
          Admin
        </Link>
        <span aria-hidden="true">/</span>
        <strong className="truncate font-semibold text-green-900">{title}</strong>
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          aria-label="Lihat situs (tab baru)"
          className="inline-flex h-8 w-[34px] items-center justify-center gap-2 rounded-[4px] border border-line-strong bg-white text-[11px] leading-none font-semibold tracking-[0.08em] text-green-900 uppercase no-underline transition-colors hover:border-green-800 min-[901px]:w-auto min-[901px]:px-[11px] [&_svg]:size-[15px]"
        >
          <ExternalLink aria-hidden="true" />
          <span className="hidden min-[901px]:inline">Lihat situs</span>
        </a>

        <div ref={userRef} className="relative">
          <button
            type="button"
            onClick={() => setUserOpen((open) => !open)}
            aria-haspopup="menu"
            aria-expanded={userOpen}
            className="flex cursor-pointer items-center gap-2.5 rounded-[4px] border border-transparent bg-transparent py-1 pr-1.5 pl-1 hover:border-line hover:bg-white"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-green-800 text-xs font-bold text-white">
              {initials(username)}
            </span>
            <span className="hidden text-left min-[901px]:block">
              <span className="block text-[13px] leading-[1.2] font-semibold text-ink">
                {username}
              </span>
              <span className="block text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                {roleLabel}
              </span>
            </span>
          </button>

          {userOpen ? (
            <div
              role="menu"
              className="absolute top-[calc(100%+6px)] right-0 z-40 min-w-60 rounded-[6px] border border-line bg-white p-1.5 shadow-[0_16px_40px_rgba(6,38,27,0.12)]"
            >
              <div className="mb-1.5 border-b border-line px-2.5 pt-2.5 pb-2">
                <p className="text-[13px] font-semibold text-ink">{username}</p>
                <p className="text-[11px] font-semibold tracking-[0.1em] text-muted uppercase">
                  {roleLabel}
                </p>
              </div>

              <Link
                href="/admin/account"
                role="menuitem"
                onClick={() => setUserOpen(false)}
                className="flex w-full items-center gap-2.5 rounded-[3px] px-2.5 py-[9px] text-[13px] text-ink no-underline hover:bg-mint-50 [&_svg]:size-4 [&_svg]:text-muted"
              >
                <UserRound aria-hidden="true" />
                Akun saya
              </Link>

              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-[3px] border-0 bg-transparent px-2.5 py-[9px] text-left text-[13px] text-ink hover:bg-mint-50 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4 [&_svg]:text-muted"
              >
                <LogOut aria-hidden="true" />
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </button>

              {logoutError ? (
                <p role="alert" className="px-2.5 pt-1 pb-2 text-xs text-danger">
                  {logoutError}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
```

### 7. `frontend/lib/relative-time.ts`
```ts
const shortDate = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Waktu relatif ala `rel()` di Design/admin/assets/admin.js:
 * "baru saja", "5 menit lalu", "3 jam lalu", "2 hari lalu", lalu tanggal.
 */
export function relativeTime(value: string | null, now = Date.now()): string {
  if (!value) return "Belum pernah";

  // Backend mengirim datetime tanpa zona waktu (UTC dari TiDB); tandai sebagai UTC
  // agar tidak dibaca sebagai waktu lokal (selisih 7 jam di WIB).
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(value);
  const time = new Date(hasZone ? value : `${value}Z`).getTime();
  if (Number.isNaN(time)) return "—";

  const minutes = Math.round((now - time) / 60000);
  if (minutes < 1) return "baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;

  const days = Math.round(hours / 24);
  return days < 7 ? `${days} hari lalu` : shortDate.format(new Date(time));
}
```

## C. Ganti seluruh isi (15)

### 8. `frontend/components/ui/Button.tsx`
```tsx
import Link from "next/link";
import type { ComponentProps, ComponentPropsWithoutRef } from "react";

/**
 * Tombol admin mengikuti `.btn` di Design/admin/assets/admin.css.
 * Nama varian lama tetap didukung agar halaman yang belum dirombak tidak rusak:
 * primary → solid, secondary → ghost, light → outline, dark → solid gelap.
 */
export type ButtonVariant =
  | "solid"
  | "outline"
  | "ghost"
  | "danger"
  | "danger-outline"
  | "primary"
  | "secondary"
  | "dark"
  | "light";

export type ButtonSize = "md" | "sm" | "xs" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  solid: "border-transparent bg-green-800 text-white hover:bg-green-700",
  primary: "border-transparent bg-green-800 text-white hover:bg-green-700",
  dark: "border-transparent bg-green-950 text-white hover:bg-green-900",
  outline:
    "border-line-strong bg-white text-green-900 hover:border-green-800",
  light:
    "border-line-strong bg-white text-green-900 hover:border-green-800",
  ghost:
    "border-transparent bg-transparent text-muted hover:bg-mint-50 hover:text-green-900",
  secondary:
    "border-transparent bg-transparent text-muted hover:bg-mint-50 hover:text-green-900",
  danger: "border-transparent bg-danger text-white hover:bg-[#8a2f1b]",
  "danger-outline":
    "border-[#e6cfc6] bg-white text-danger hover:border-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-[38px] text-[11.5px] tracking-[0.08em]",
  sm: "h-8 text-[11px] tracking-[0.08em]",
  xs: "h-7 text-[11px] tracking-[0.06em]",
  icon: "size-[34px] text-[11px]",
};

/** Padding dipisah agar `.btn--ghost` (10px) tidak bertabrakan dengan padding ukuran. */
function paddingClass(variant: ButtonVariant, size: ButtonSize): string {
  if (size === "icon") return "px-0";
  if (variant === "ghost" || variant === "secondary") return "px-2.5";
  if (size === "sm") return "px-[11px]";
  if (size === "xs") return "px-[9px]";
  return "px-4";
}

type SharedButtonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function buttonClassName({
  variant = "solid",
  size = "md",
  className = "",
}: SharedButtonProps & { className?: string } = {}) {
  return [
    "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[4px] border font-sans leading-none font-semibold whitespace-nowrap uppercase transition-[background-color,border-color,color,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 [&_svg]:size-[15px] [&_svg]:shrink-0",
    sizeClasses[size],
    paddingClass(variant, size),
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "solid",
  size = "md",
  className,
  type = "button",
  ...props
}: ComponentPropsWithoutRef<"button"> & SharedButtonProps) {
  return (
    <button
      type={type}
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "solid",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & SharedButtonProps) {
  return (
    <Link
      className={buttonClassName({ variant, size, className })}
      {...props}
    />
  );
}
```

### 9. `frontend/components/ui/Input.tsx`
```tsx
import type { ComponentProps } from "react";

export type InputProps = ComponentProps<"input"> & {
  invalid?: boolean;
};

const inputBaseClasses =
  "min-h-10 px-3 py-2.5 w-full rounded-[4px] border border-line bg-white text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] read-only:bg-mint-50 read-only:text-muted disabled:cursor-not-allowed disabled:bg-mint-50 disabled:text-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:shadow-[0_0_0_3px_rgba(163,58,34,0.08)]";

export function Input({
  invalid = false,
  className = "",
  ...props
}: InputProps) {
  return (
    <input
      {...props}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={[inputBaseClasses, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
```

### 10. `frontend/components/ui/Select.tsx`
```tsx
import type { ComponentProps } from "react";

export type SelectProps = ComponentProps<"select"> & {
  invalid?: boolean;
  placeholder?: string;
};

const selectBaseClasses =
  "min-h-10 appearance-none px-3 py-2.5 pr-8 w-full rounded-[4px] border border-line bg-white text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] disabled:cursor-not-allowed disabled:bg-mint-50 disabled:text-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:shadow-[0_0_0_3px_rgba(163,58,34,0.08)]";

export function Select({
  invalid = false,
  placeholder,
  className = "",
  children,
  ...props
}: SelectProps) {
  return (
    <span className="relative block">
      <select
        {...props}
        aria-invalid={invalid || props["aria-invalid"] || undefined}
        className={[selectBaseClasses, className]
          .filter(Boolean)
          .join(" ")}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}

        {children}
      </select>

      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-muted"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </span>
  );
}
```

### 11. `frontend/components/ui/Textarea.tsx`
```tsx
import type { ComponentProps } from "react";

export type TextareaProps = ComponentProps<"textarea"> & {
  invalid?: boolean;
};

const textareaBaseClasses =
  "min-h-[120px] resize-y px-3 py-2.5 leading-[1.6] w-full rounded-[4px] border border-line bg-white text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted-light hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)] read-only:bg-mint-50 read-only:text-muted disabled:cursor-not-allowed disabled:bg-mint-50 disabled:text-muted disabled:opacity-70 aria-invalid:border-danger aria-invalid:shadow-[0_0_0_3px_rgba(163,58,34,0.08)]";

export function Textarea({
  invalid = false,
  rows = 4,
  className = "",
  ...props
}: TextareaProps) {
  return (
    <textarea
      {...props}
      rows={rows}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={[textareaBaseClasses, className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
```

### 12. `frontend/components/ui/Checkbox.tsx`
```tsx
"use client";

import { useId, type ComponentProps, type ReactNode } from "react";

export type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
  label: ReactNode;
  description?: ReactNode;
};

export function Checkbox({
  label,
  description,
  id,
  className = "",
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description
    ? `${controlId}-description`
    : undefined;

  const describedBy =
    [props["aria-describedby"], descriptionId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <label
      htmlFor={controlId}
      className={[
        "flex cursor-pointer items-start gap-3 text-sm text-ink",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <input
        {...props}
        id={controlId}
        type="checkbox"
        aria-describedby={describedBy}
        className="mt-0.5 size-4 shrink-0 cursor-pointer accent-green-800 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <span className="min-w-0">
        <span className="block font-medium leading-6">{label}</span>

        {description ? (
          <span
            id={descriptionId}
            className="mt-0.5 block text-xs leading-5 text-muted"
          >
            {description}
          </span>
        ) : null}
      </span>
    </label>
  );
}
```

### 13. `frontend/components/ui/FormField.tsx`
```tsx
"use client";

import {
  cloneElement,
  useId,
  type AriaAttributes,
  type ReactElement,
  type ReactNode,
} from "react";

type FormFieldControlProps = {
  id?: string;
  required?: boolean;
  "aria-describedby"?: string;
  "aria-invalid"?: AriaAttributes["aria-invalid"];
};

export type FormFieldProps = {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
  children: ReactElement<FormFieldControlProps>;
};

export function FormField({
  id,
  label,
  hint,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const generatedId = useId();
  const childProps = children.props;
  const controlId = childProps.id ?? id ?? generatedId;

  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;

  const describedBy =
    [childProps["aria-describedby"], hintId, errorId]
      .filter(Boolean)
      .join(" ") || undefined;

  const control = cloneElement(children, {
    id: controlId,
    required: required || childProps.required,
    "aria-describedby": describedBy,
    "aria-invalid": error ? true : childProps["aria-invalid"],
  });

  return (
    <div
      className={["grid gap-1.5", className]
        .filter(Boolean)
        .join(" ")}
    >
      <label
        htmlFor={controlId}
        className="block text-[11px] font-semibold tracking-[0.08em] text-green-900 uppercase"
      >
        {label}

        {required ? (
          <>
            <span aria-hidden="true" className="ml-0.5 text-danger">
              *
            </span>
            <span className="sr-only"> (wajib)</span>
          </>
        ) : null}
      </label>

      {control}

      {hint ? (
        <p id={hintId} className="text-xs leading-5 text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs leading-5 text-danger"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
```

### 14. `frontend/components/admin/shared/FormDialog.tsx`
```tsx
"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type DialogSize = "sm" | "md" | "lg" | "xl";

interface FormDialogProps {
  open: boolean;
  title: string;
  description?: string;
  eyebrow?: string;
  size?: DialogSize;
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * Panel geser dari kanan, mengikuti `.drawer` di Design/admin/assets/admin.css.
 * Nama dan props tetap sama dengan dialog lama agar semua pemakai tidak berubah.
 * Memakai <dialog> + showModal() sehingga fokus terkunci di dalam panel,
 * Escape menutup, dan konten di belakang tidak bisa diklik.
 */
const sizeClasses: Record<DialogSize, string> = {
  sm: "w-[min(440px,100%)]",
  md: "w-[min(520px,100%)]",
  lg: "w-[min(680px,100%)]",
  xl: "w-[min(860px,100%)]",
};

export default function FormDialog({
  open,
  title,
  description,
  eyebrow,
  size = "md",
  busy = false,
  onClose,
  children,
}: FormDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();

        if (!busy) {
          onClose();
        }
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !busy) {
          onClose();
        }
      }}
      className={`fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none max-w-none flex-col overflow-hidden border-0 bg-[#fbfdfc] p-0 text-ink shadow-[-20px_0_50px_rgba(6,38,27,0.15)] transition-[translate] duration-300 ease-[cubic-bezier(.16,1,.3,1)] backdrop:bg-[rgba(6,38,27,0.42)] open:flex starting:open:translate-x-full ${sizeClasses[size]}`}
    >
      {open && (
        <>
          <header className="flex shrink-0 items-start justify-between gap-3 border-b border-line px-6 pt-[22px] pb-[18px]">
            <div className="min-w-0">
              {eyebrow && (
                <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-green-700 uppercase">
                  {eyebrow}
                </p>
              )}

              <h2
                id={titleId}
                className="mt-1.5 font-serif text-xl leading-[1.25] font-bold text-green-900"
              >
                {title}
              </h2>

              {description && (
                <p
                  id={descriptionId}
                  className="mt-1.5 text-[13px] leading-[1.55] text-muted"
                >
                  {description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              aria-label="Tutup panel"
              className="grid size-[38px] shrink-0 cursor-pointer place-items-center rounded-[4px] text-muted transition-colors hover:bg-mint-50 hover:text-green-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <X aria-hidden="true" className="size-[19px]" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </>
      )}
    </dialog>
  );
}
```

### 15. `frontend/components/admin/shared/ConfirmDialog.tsx`
```tsx
"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/Button";

type ConfirmTone = "danger" | "default";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  eyebrow?: string;
  confirmLabel?: string;
  busyLabel?: string;
  busy?: boolean;
  error?: string;
  tone?: ConfirmTone;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Dialog konfirmasi di tengah layar, mengikuti `.modal` + `confirmDialog()`
 * di Design/admin. Props tetap sama dengan versi lama.
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  eyebrow,
  confirmLabel = "Konfirmasi",
  busyLabel = "Memproses...",
  busy = false,
  error = "",
  tone = "danger",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();

        if (!busy) {
          onCancel();
        }
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !busy) {
          onCancel();
        }
      }}
      className="m-auto w-[min(440px,calc(100%-32px))] max-w-none overflow-hidden rounded-[6px] border-0 bg-white p-0 text-ink shadow-[0_30px_70px_rgba(6,38,27,0.25)] transition-[opacity,scale] duration-200 backdrop:bg-[rgba(6,38,27,0.42)] starting:open:scale-95 starting:open:opacity-0"
    >
      {open && (
        <>
          <div className="px-[26px] pt-[26px] pb-5">
            <div
              className={`mb-3.5 grid size-11 place-items-center rounded-full ${
                tone === "danger"
                  ? "bg-danger-bg text-danger"
                  : "bg-mint text-green-800"
              }`}
              aria-hidden="true"
            >
              <TriangleAlert className="size-5" />
            </div>

            {eyebrow && (
              <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-muted-light uppercase">
                {eyebrow}
              </p>
            )}

            <h2
              id={titleId}
              className="mt-1 font-serif text-[19px] leading-[1.25] font-bold text-green-900"
            >
              {title}
            </h2>

            <div className="mt-2 text-sm leading-[1.55] text-muted">
              {description}
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-[4px] border border-[#ebcfc6] bg-danger-bg px-3.5 py-3 text-[13px] text-danger"
              >
                {error}
              </div>
            )}
          </div>

          <footer className="flex justify-end gap-2 border-t border-line bg-mint-50 px-5 py-3.5">
            <Button variant="outline" onClick={onCancel} disabled={busy}>
              Batal
            </Button>

            <Button
              variant={tone === "danger" ? "danger" : "solid"}
              onClick={onConfirm}
              disabled={busy}
            >
              {busy ? busyLabel : confirmLabel}
            </Button>
          </footer>
        </>
      )}
    </dialog>
  );
}
```

### 16. `frontend/components/admin/shared/RequirePermission.tsx`
```tsx
"use client";

import type { ReactNode } from "react";

import { Lock } from "lucide-react";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import type { PermissionName } from "@/features/auth/permissions";

export type RequirePermissionProps = {
  permission?: PermissionName;
  anyOf?: readonly PermissionName[];
  superadminOnly?: boolean;
  children: ReactNode;
};

/**
 * Pembungkus halaman admin. Tidak melakukan redirect otomatis saat akses
 * ditolak; pengguna diberi panel dan tombol menuju Dashboard.
 */
export function RequirePermission({
  permission,
  anyOf,
  superadminOnly = false,
  children,
}: RequirePermissionProps) {
  const { can, isSuperadmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted">Memuat...</p>
      </div>
    );
  }

  const hasRequiredPermission = permission
    ? can(permission)
    : anyOf
      ? anyOf.some((name) => can(name))
      : true;

  const allowed =
    (!superadminOnly || isSuperadmin) &&
    (isSuperadmin || hasRequiredPermission);

  if (!allowed) {
    return (
      <AdminPage>
        <div className="rounded-[4px] border border-line bg-white">
          <StateBlock
            icon={<Lock />}
            label="Akses ditolak"
            title="Anda tidak punya akses ke halaman ini"
            action={
              <ButtonLink href="/admin/dashboard" variant="outline">
                Kembali ke dashboard
              </ButtonLink>
            }
          >
            Hubungi superadmin bila Anda memerlukan akses ke halaman ini.
          </StateBlock>
        </div>
      </AdminPage>
    );
  }

  return <>{children}</>;
}
```

### 17. `frontend/components/admin/shell/admin-navigation.tsx`
```tsx
import type { ReactNode } from "react";
import {
  BarChart3,
  FileText,
  History,
  LayoutGrid,
  ListChecks,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  PERMISSIONS,
  type PermissionName,
} from "@/features/auth/permissions";

export type NavGroup = "Utama" | "Konten" | "Organisasi" | "Sistem";

export interface NavItem {
  href: string;
  label: string;
  permission: PermissionName;
  group: NavGroup;
  icon: ReactNode;
  exact?: boolean;
}

/** Urutan dan pengelompokan mengikuti `ROUTES` di Design/admin/assets/admin.js. */
export const navGroups: NavGroup[] = ["Utama", "Konten", "Organisasi", "Sistem"];

export const navItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    permission: PERMISSIONS.DASHBOARD_VIEW,
    group: "Utama",
    exact: true,
    icon: <LayoutGrid />,
  },
  {
    href: "/admin/news",
    label: "Publikasi",
    permission: PERMISSIONS.NEWS_VIEW,
    group: "Konten",
    icon: <FileText />,
  },
  {
    href: "/admin/programs",
    label: "Program Kerja",
    permission: PERMISSIONS.PROGRAMS_VIEW,
    group: "Konten",
    icon: <ListChecks />,
  },
  {
    href: "/admin/organization",
    label: "Struktur Organisasi",
    permission: PERMISSIONS.ORGANIZATION_VIEW,
    group: "Organisasi",
    icon: <Users />,
  },
  {
    href: "/admin/accounts",
    label: "Administrator",
    permission: PERMISSIONS.ADMINS_VIEW,
    group: "Sistem",
    icon: <ShieldCheck />,
  },
  {
    href: "/admin/activity-logs",
    label: "Log Aktivitas",
    permission: PERMISSIONS.ACTIVITY_LOGS_VIEW,
    group: "Sistem",
    icon: <History />,
  },
  {
    href: "/admin/visitor-logs",
    label: "Statistik Pengunjung",
    permission: PERMISSIONS.VISITOR_LOGS_VIEW,
    group: "Sistem",
    icon: <BarChart3 />,
  },
  {
    href: "/admin/settings",
    label: "Pengaturan Situs",
    permission: PERMISSIONS.SETTINGS_VIEW,
    group: "Sistem",
    icon: <Settings />,
  },
];

/** Hanya route yang halamannya sudah ada yang tampil di menu. */
export const implementedAdminRoutes = new Set([
  "/admin/dashboard",
  "/admin/news",
  "/admin/programs",
  "/admin/organization",
  "/admin/accounts",
  "/admin/account",
  "/admin/settings",
]);

export function isItemActive(pathname: string, item: NavItem): boolean {
  if (item.exact) {
    return pathname === item.href;
  }

  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** Judul halaman untuk breadcrumb topbar. */
export function pageTitleFor(pathname: string): string {
  if (pathname === "/admin/account") return "Akun Saya";
  const item = navItems.find((nav) => isItemActive(pathname, nav));
  return item?.label ?? "Admin";
}
```

### 18. `frontend/components/admin/shell/AdminSidebar.tsx`
```tsx
"use client";

import Link from "next/link";

import { useAuth } from "@/features/auth/AuthContext";

import {
  implementedAdminRoutes,
  isItemActive,
  navGroups,
  navItems,
} from "./admin-navigation";

/** Logo garis dari `LOGO` di Design/admin/assets/admin.js. */
export function AdminLogo({ className = "size-[30px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={`shrink-0 ${className}`}>
      <g fill="none" stroke="#C9D6CF" strokeWidth="2.2">
        <path d="M20 21 C12 4, 2 8, 4 14 C6 20, 14 21, 20 21Z" />
        <path d="M20 21 C28 4, 38 8, 36 14 C34 20, 26 21, 20 21Z" />
        <path d="M20 21 C14 28, 16 38, 20 38 C24 38, 26 28, 20 21Z" />
      </g>
      <polygon
        points="20,16.5 23.5,18.5 23.5,22.5 20,24.5 16.5,22.5 16.5,18.5"
        fill="#06261B"
        stroke="#C9D6CF"
        strokeWidth="1.4"
      />
    </svg>
  );
}

/** `.sidebar` di Design/admin/assets/admin.css. */
export function AdminSidebar({
  pathname,
  periodName,
  onNavigate,
}: {
  pathname: string;
  periodName: string | null;
  onNavigate?: () => void;
}) {
  const { can } = useAuth();

  const visibleItems = navItems.filter(
    (item) => can(item.permission) && implementedAdminRoutes.has(item.href),
  );

  return (
    <div className="flex h-full flex-col bg-green-950 text-white">
      <Link
        href="/admin/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-3 border-b border-line-on-dark px-5 pt-5 pb-[18px] no-underline"
      >
        <AdminLogo />
        <span>
          <span className="block font-serif text-[13px] leading-[1.15] font-bold tracking-[0.02em] uppercase">
            Hima Teknokimia Nuklir
          </span>
          <span className="mt-[3px] block text-[11px] leading-[1.3] font-medium tracking-[0.1em] text-on-dark-muted uppercase">
            Panel Admin
          </span>
        </span>
      </Link>

      <nav aria-label="Navigasi admin" className="flex-1 px-3 pt-3.5 pb-5">
        {navGroups.map((group) => {
          const items = visibleItems.filter((item) => item.group === group);

          if (items.length === 0) return null;

          return (
            <div key={group} className="mt-[18px] first:mt-0">
              <p className="px-2.5 pb-2 text-[11px] font-semibold tracking-[0.1em] text-[#93ACA0] uppercase">
                {group}
              </p>

              {items.map((item) => {
                const active = isItemActive(pathname, item);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`relative flex h-[38px] items-center gap-[11px] rounded-[4px] px-2.5 text-[13.5px] no-underline transition-colors [&_svg]:size-[17px] [&_svg]:shrink-0 ${
                      active
                        ? "bg-[rgba(227,238,232,0.1)] text-white before:absolute before:top-2 before:bottom-2 before:-left-3 before:w-[3px] before:rounded-r-[2px] before:bg-mint [&_svg]:opacity-100"
                        : "text-[#C9D6CF] hover:bg-white/5 hover:text-white [&_svg]:opacity-80"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-line-on-dark px-5 pt-3.5 pb-[18px] text-xs text-on-dark-muted">
        Periode aktif{" "}
        <strong className="text-white">{periodName ?? "belum ada"}</strong>
      </div>
    </div>
  );
}
```

### 19. `frontend/components/admin/shell/AdminShell.tsx`
```tsx
"use client";

import { usePathname } from "next/navigation";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { getPublicOrganization } from "@/features/organization/public-api";

import { pageTitleFor } from "./admin-navigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

/**
 * Kerangka panel admin, mengikuti `.shell` di Design/admin/assets/admin.css:
 * sidebar 256px (≤900px menjadi panel geser), topbar 64px, lalu konten.
 * Konten tidak diberi padding di sini; tiap halaman memakai <AdminPage>.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [periodName, setPeriodName] = useState<string | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const closeMobileMenu = useCallback(() => {
    setMobileOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getPublicOrganization({ signal: controller.signal })
      .then((data) => setPeriodName(data.period?.name ?? null))
      .catch(() => {
        /* Nama periode hanya informasi tambahan di sidebar. */
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeMobileMenu();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, closeMobileMenu]);

  return (
    <div className="admin-theme min-h-screen">
      <a
        href="#content"
        className="absolute -top-16 left-3 z-[200] rounded-[4px] bg-green-800 px-3.5 py-2 text-white focus:top-3"
      >
        Langsung ke konten
      </a>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Tutup navigasi"
          className="fixed inset-0 z-[65] cursor-default bg-[rgba(6,38,27,0.42)] min-[901px]:hidden"
          onClick={closeMobileMenu}
        />
      ) : null}

      <aside
        id="admin-navigation"
        aria-label="Navigasi admin"
        className={`fixed inset-y-0 left-0 z-[70] w-[280px] overflow-y-auto border-r border-line-on-dark transition-transform duration-300 ease-[cubic-bezier(.16,1,.3,1)] min-[901px]:z-40 min-[901px]:w-64 min-[901px]:translate-x-0 ${
          mobileOpen
            ? "translate-x-0 shadow-[20px_0_50px_rgba(6,38,27,0.3)]"
            : "-translate-x-full"
        }`}
      >
        <AdminSidebar
          pathname={pathname}
          periodName={periodName}
          onNavigate={() => setMobileOpen(false)}
        />
      </aside>

      <div className="flex min-h-screen min-w-0 flex-col min-[901px]:pl-64">
        <AdminTopbar
          title={pageTitleFor(pathname)}
          menuOpen={mobileOpen}
          onMenuOpen={() => setMobileOpen(true)}
          menuButtonRef={menuButtonRef}
        />

        <div id="content" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### 20. `frontend/app/(private)/(admin)/layout.tsx`
```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/features/auth/AuthContext";
import { AdminShell } from "@/components/admin/shell/AdminShell";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { admin, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !admin) {
      router.replace("/login");
    }
  }, [admin, isLoading, router]);

  if (isLoading) {
    return (
      <main className="admin-theme flex min-h-screen items-center justify-center">
        <p className="text-sm text-muted">Memuat...</p>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}
```

### 21. `frontend/app/(private)/(auth)/login/page.tsx`
```tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, TriangleAlert } from "lucide-react";

import { AdminLogo } from "@/components/admin/shell/AdminSidebar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";

const inputClasses =
  "w-full rounded-[4px] border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition-[border-color,box-shadow] duration-150 hover:border-line-strong focus-visible:border-green-800 focus-visible:shadow-[0_0_0_3px_rgba(15,77,54,0.1)]";

const labelClasses =
  "text-[11px] font-semibold tracking-[0.08em] text-green-900 uppercase";

/** Halaman login mengikuti Design/admin/login.html (`.login`). */
export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin/dashboard");
    }
  }, [isLoading, isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsSubmitting(true);

    try {
      await login({ username, password });
      router.replace("/admin/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Login gagal. Silakan coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="admin-theme flex min-h-screen items-center justify-center px-4">
        <p className="text-sm text-muted">Memuat sesi...</p>
      </main>
    );
  }

  return (
    <main className="admin-theme grid min-h-screen grid-cols-1 min-[901px]:grid-cols-[1.05fr_1fr]">
      <section
        aria-hidden="true"
        className="relative flex min-h-60 flex-col justify-between gap-6 overflow-hidden bg-green-950 px-6 py-7 text-white min-[901px]:min-h-0 min-[901px]:p-12"
      >
        {/* Foto latar seperti `.login__side::before` + gradien `::after`. */}
        <div className="absolute inset-0 bg-[url('/images/hero-group.jpg')] bg-cover bg-center opacity-[0.16] grayscale" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,38,27,0.4),rgba(6,38,27,0.92))]" />

        <div className="relative z-10 flex items-center gap-3">
          <AdminLogo className="size-[34px]" />
          <span>
            <span className="block font-serif text-[13px] leading-[1.15] font-bold tracking-[0.02em] uppercase">
              Hima Teknokimia Nuklir
            </span>
            <span className="mt-[3px] block text-[11px] leading-[1.3] font-medium tracking-[0.1em] text-on-dark-muted uppercase">
              Politeknik Teknologi Nuklir
            </span>
          </span>
        </div>

        <div className="relative z-10">
          <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-on-dark-muted uppercase">
            Panel Admin
          </p>
          <h1 className="mt-3.5 font-serif text-[clamp(32px,3.4vw,46px)] leading-[1.15] font-bold text-white">
            Kelola situs <em className="block">HIMATKN</em>
          </h1>
          <p className="mt-4 hidden max-w-[40ch] text-[15px] text-on-dark-muted min-[901px]:block">
            Publikasi, program kerja, dan struktur kepengurusan HIMATKN dalam
            satu tempat.
          </p>
        </div>

        <p className="relative z-10 text-xs text-on-dark-muted">
          © {new Date().getFullYear()} HIMATKN
        </p>
      </section>

      <section className="grid place-items-center px-6 py-12">
        <div className="w-full max-w-[380px]">
          <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-green-700 uppercase">
            Masuk
          </p>
          <h2 className="mt-2.5 font-serif text-[28px] leading-[1.25] font-bold text-green-900">
            Selamat datang kembali
          </h2>
          <p className="mt-1.5 text-muted">
            Gunakan akun administrator yang diberikan superadmin.
          </p>

          {error ? (
            <div
              role="alert"
              className="mt-[22px] flex items-start gap-3 rounded-[4px] border border-[#ebcfc6] bg-danger-bg px-3.5 py-3 text-[13px] text-danger [&_svg]:mt-px [&_svg]:size-[17px] [&_svg]:shrink-0"
            >
              <TriangleAlert aria-hidden="true" />
              <span>{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="mt-7">
            <div className="grid gap-1.5">
              <label htmlFor="username" className={labelClasses}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                required
                className={inputClasses}
              />
            </div>

            <div className="mt-4 grid gap-1.5">
              <label htmlFor="password" className={labelClasses}>
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className={`${inputClasses} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={
                    showPassword
                      ? "Sembunyikan kata sandi"
                      : "Tampilkan kata sandi"
                  }
                  aria-pressed={showPassword}
                  className="absolute top-1/2 right-1 grid size-9 -translate-y-1/2 cursor-pointer place-items-center border-0 bg-transparent text-muted [&_svg]:size-[18px]"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" />
                  ) : (
                    <Eye aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-[22px] h-[46px]! w-full"
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <div className="mt-7 flex justify-between gap-4 text-xs text-muted">
            <Link href="/" className="text-muted hover:text-green-800">
              ← Kembali ke situs
            </Link>
            <span>Lupa kata sandi? Hubungi superadmin.</span>
          </div>
        </div>
      </section>
    </main>
  );
}
```

### 22. `frontend/app/(private)/(admin)/admin/dashboard/page.tsx`
```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  ListChecks,
  Plus,
  TriangleAlert,
  Users,
} from "lucide-react";

import { AdminPage } from "@/components/admin/shared/AdminPage";
import { Badge, type BadgeTone } from "@/components/admin/shared/Badge";
import { Card } from "@/components/admin/shared/Card";
import { RequirePermission } from "@/components/admin/shared/RequirePermission";
import { StateBlock } from "@/components/admin/shared/StateBlock";
import { Button, ButtonLink } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/AuthContext";
import { PERMISSIONS } from "@/features/auth/permissions";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/features/dashboard/admin-api";
import { getAdminNews } from "@/features/news/admin-api";
import type { AdminNews, NewsStatus } from "@/features/news/types";
import { getPublicOrganization } from "@/features/organization/public-api";
import { relativeTime } from "@/lib/relative-time";

/** `NEWS_STATUS` di Design/admin/assets/admin.js. */
const newsStatus: Record<NewsStatus, [string, BadgeTone]> = {
  published: ["Terbit", "green"],
  draft: ["Draft", "amber"],
  archived: ["Arsip", "grey"],
};

const numberFormat = new Intl.NumberFormat("id-ID");

function StatSkeleton() {
  return (
    <div className="h-[110px] animate-pulse rounded-[4px] border border-line bg-white" />
  );
}

/** Dashboard mengikuti `viewDashboard()` di Design/admin/assets/admin.js. */
export default function DashboardPage() {
  const { admin, can, isSuperadmin } = useAuth();

  const canViewNews = can(PERMISSIONS.NEWS_VIEW);
  const canViewPrograms = can(PERMISSIONS.PROGRAMS_VIEW);
  const canViewOrganization = can(PERMISSIONS.ORGANIZATION_VIEW);
  const canViewVisitors = can(PERMISSIONS.VISITOR_LOGS_VIEW);
  const canCreateNews = can(PERMISSIONS.NEWS_CREATE);
  const canManageOrganization = can(PERMISSIONS.ORGANIZATION_MANAGE);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [latest, setLatest] = useState<AdminNews[]>([]);
  const [periodName, setPeriodName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!admin) return;

    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const [statsResult, newsResult, organization] = await Promise.all([
          getDashboardStats({ signal }),
          canViewNews
            ? getAdminNews({ limit: 5 }, { signal })
            : Promise.resolve(null),
          getPublicOrganization({ signal }).catch(() => null),
        ]);

        if (signal.aborted) return;

        setStats(statsResult);
        setLatest(newsResult?.items ?? []);
        setPeriodName(organization?.period?.name ?? null);
      } catch (loadError) {
        if (signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Data dashboard gagal dimuat.",
        );
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    }

    void load();

    return () => controller.abort();
  }, [admin, canViewNews, reloadKey]);

  if (!admin) return null;

  const statCards = stats
    ? [
        canViewNews && {
          href: "/admin/news",
          label: "Publikasi",
          value: stats.news_total,
          icon: <FileText />,
        },
        canViewPrograms && {
          href: "/admin/programs",
          label: "Program kerja",
          value: stats.programs_total,
          icon: <ListChecks />,
        },
        canViewOrganization && {
          href: "/admin/organization",
          label: "Anggota (semua periode)",
          value: stats.members_total,
          icon: <Users />,
        },
        canViewVisitors && {
          href: "/admin/visitor-logs",
          label: "Kunjungan",
          value: stats.visitors_total,
          icon: <BarChart3 />,
        },
      ].filter((card) => card !== false)
    : [];

  const quickActions = [
    canCreateNews && { href: "/admin/news", label: "Tulis publikasi" },
    canManageOrganization && {
      href: "/admin/organization",
      label: "Tambah anggota",
    },
  ].filter((action) => action !== false);

  return (
    <RequirePermission permission={PERMISSIONS.DASHBOARD_VIEW}>
      <AdminPage>
        {/* `.hero-card` */}
        <section className="relative mb-4 flex flex-wrap items-end justify-between gap-6 overflow-hidden rounded-[4px] bg-green-950 px-7 py-[26px] text-white after:absolute after:-top-[60px] after:-right-[60px] after:size-60 after:rounded-full after:border after:border-line-on-dark after:shadow-[0_0_0_40px_rgba(28,61,49,0.25),0_0_0_80px_rgba(28,61,49,0.15)]">
          <div className="relative z-10">
            <p className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-on-dark-muted uppercase">
              {periodName ? `Periode aktif ${periodName}` : "Belum ada periode aktif"}
            </p>
            <h1 className="mt-2.5 font-serif text-[26px] leading-[1.25] font-bold text-white">
              Selamat datang, {admin.username}
            </h1>
            <p className="mt-1.5 text-on-dark-muted">
              Anda masuk sebagai{" "}
              <strong className="text-white">
                {isSuperadmin ? "Superadmin" : "Admin"}
              </strong>
              .
            </p>
          </div>

          {quickActions.length > 0 ? (
            <div className="relative z-10 flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className={`inline-flex h-[38px] items-center justify-center gap-2 rounded-[4px] border px-4 text-[11.5px] leading-none font-semibold tracking-[0.08em] uppercase no-underline transition-colors [&_svg]:size-[15px] ${
                    index === 0
                      ? "border-transparent bg-white text-green-900 hover:bg-mint"
                      : "border-white/35 bg-transparent text-white hover:border-white hover:bg-white/5"
                  }`}
                >
                  <Plus aria-hidden="true" />
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}
        </section>

        {error ? (
          <Card>
            <StateBlock
              tone="error"
              icon={<TriangleAlert />}
              label="Gagal memuat"
              title="Data dashboard tidak dapat ditampilkan"
              action={
                <Button
                  variant="outline"
                  onClick={() => setReloadKey((key) => key + 1)}
                >
                  Coba lagi
                </Button>
              }
            >
              {error}
            </StateBlock>
          </Card>
        ) : (
          <>
            {/* `.grid--stats` */}
            <div className="mb-4 grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-4">
              {isLoading
                ? [0, 1, 2, 3].map((item) => <StatSkeleton key={item} />)
                : statCards.map((card) => (
                    <Link
                      key={card.href}
                      href={card.href}
                      className="block rounded-[4px] border border-line bg-white px-[18px] pt-[18px] pb-4 no-underline transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[0_8px_22px_rgba(6,38,27,0.06)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] leading-[1.2] font-semibold tracking-[0.1em] text-muted-light uppercase">
                          {card.label}
                        </span>
                        <span className="grid size-8 place-items-center rounded-full bg-mint text-green-800 [&_svg]:size-4">
                          {card.icon}
                        </span>
                      </div>
                      <div className="mt-4 font-serif text-[30px] leading-[1.1] font-bold text-green-900">
                        {numberFormat.format(card.value)}
                      </div>
                    </Link>
                  ))}
            </div>

            {canViewNews ? (
              <Card
                title="Publikasi terbaru"
                bodyClassName="p-0"
                action={
                  <ButtonLink href="/admin/news" variant="ghost" size="sm">
                    Lihat semua
                  </ButtonLink>
                }
              >
                {isLoading ? (
                  <div className="space-y-3 p-5">
                    {[0, 1, 2].map((item) => (
                      <div
                        key={item}
                        className="h-10 animate-pulse rounded bg-green-900/5"
                      />
                    ))}
                  </div>
                ) : latest.length === 0 ? (
                  <StateBlock
                    icon={<FileText />}
                    title="Belum ada publikasi"
                    action={
                      canCreateNews ? (
                        <ButtonLink href="/admin/news">Tulis publikasi</ButtonLink>
                      ) : undefined
                    }
                  >
                    Publikasi pertama akan muncul di sini.
                  </StateBlock>
                ) : (
                  <ul className="m-0 list-none p-0">
                    {latest.map((news) => {
                      const [statusLabel, statusTone] = newsStatus[news.status];

                      return (
                        <li
                          key={news.id}
                          className="flex items-start gap-3 border-b border-line px-5 py-3 last:border-b-0"
                        >
                          <span className="grid size-[30px] shrink-0 place-items-center rounded-full border border-line bg-mint-50 text-green-800 [&_svg]:size-3.5">
                            <FileText aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <Link
                              href="/admin/news"
                              className="font-medium text-ink no-underline hover:text-green-800 hover:underline"
                            >
                              {news.title}
                            </Link>
                            <div className="mt-0.5 text-xs text-muted">
                              Diperbarui {relativeTime(news.updated_at)}
                            </div>
                          </div>
                          <Badge tone={statusTone}>{statusLabel}</Badge>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>
            ) : null}
          </>
        )}
      </AdminPage>
    </RequirePermission>
  );
}
```

## Catatan
- Halaman admin lain (Publikasi, Program, Struktur, Akun, Pengaturan) belum dirombak, tapi otomatis ikut berwarna hijau-mint lewat token, dan form/dialognya sudah memakai panel geser baru. Perombakan penuh di ADM-2 dan seterusnya.
- Tombol "Tulis publikasi" di dashboard sementara mengarah ke daftar publikasi sampai editor dibuat di ADM-2.
- Font Playfair masih dimuat di `app/layout.tsx` tetapi tidak dipakai admin lagi; tidak dihapus sesuai permintaan.
