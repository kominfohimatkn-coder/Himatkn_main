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