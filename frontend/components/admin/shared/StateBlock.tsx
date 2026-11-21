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