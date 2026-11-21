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