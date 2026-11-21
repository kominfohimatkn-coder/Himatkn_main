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