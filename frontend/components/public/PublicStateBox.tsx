import type { ReactNode } from "react";

/**
 * Kotak state publik mengikuti `.state-box` di Prototype V1:
 * ikon bulat, label kecil, judul serif, dan salinan singkat.
 */
type PublicStateBoxProps = {
  tone?: "light" | "dark" | "error";
  icon: ReactNode;
  label: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
};

const boxClasses = {
  light: "border-dashed border-[#C9D4CE] bg-white",
  dark: "border-dashed border-line-on-dark bg-transparent",
  error: "border-solid border-danger/30 bg-danger/5",
} as const;

const iconClasses = {
  light: "bg-mint text-green-800",
  dark: "bg-[#0B3125] text-white",
  error: "bg-danger/10 text-danger",
} as const;

const labelClasses = {
  light: "text-green-700",
  dark: "text-on-dark-soft",
  error: "text-danger",
} as const;

const titleClasses = {
  light: "text-green-900",
  dark: "text-white",
  error: "text-green-900",
} as const;

const copyClasses = {
  light: "text-muted",
  dark: "text-on-dark-soft",
  error: "text-muted",
} as const;

export function PublicStateBox({
  tone = "light",
  icon,
  label,
  title,
  children,
  action,
}: PublicStateBoxProps) {
  return (
    <div
      className={`mt-10 rounded-[4px] border px-6 py-12 text-center ${boxClasses[tone]}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <div
        className={`mx-auto mb-4 grid size-12 place-items-center rounded-full ${iconClasses[tone]}`}
        aria-hidden="true"
      >
        {icon}
      </div>
      <p
        className={`text-xs font-semibold tracking-[0.1em] uppercase ${labelClasses[tone]}`}
      >
        {label}
      </p>
      <h3
        className={`mt-2.5 font-serif text-[19px] font-semibold ${titleClasses[tone]}`}
      >
        {title}
      </h3>
      <p className={`mx-auto mt-2 max-w-[46ch] text-sm ${copyClasses[tone]}`}>
        {children}
      </p>
      {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
    </div>
  );
}
