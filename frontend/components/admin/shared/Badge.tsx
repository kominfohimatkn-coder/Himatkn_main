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