import type { ReactNode } from "react";

/**
 * Kepala halaman daftar (`.page-title`, `.page-intro`, `.page-rule` di
 * Design/assets/style.css): judul tengah, intro opsional, garis pemisah.
 * Ketiganya naik bergantian saat halaman dibuka.
 */
export function PublicPageHeader({
  title,
  intro,
}: {
  title: ReactNode;
  intro?: ReactNode;
}) {
  return (
    <>
      <h1 className="text-center font-serif text-[clamp(32px,3.4vw,44px)] leading-[1.25] font-bold text-green-900 motion-safe:animate-fade-up">
        {title}
      </h1>
      {intro ? (
        <p
          style={{ animationDelay: "80ms" }}
          className="mx-auto mt-3.5 max-w-[56ch] text-center text-muted motion-safe:animate-fade-up"
        >
          {intro}
        </p>
      ) : null}
      <hr
        style={{ animationDelay: "160ms" }}
        className="mx-auto mt-[30px] mb-10 h-px w-full max-w-[760px] border-0 bg-line motion-safe:animate-fade-up"
      />
    </>
  );
}