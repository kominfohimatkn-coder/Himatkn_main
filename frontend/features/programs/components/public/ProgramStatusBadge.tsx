import { normalizeProgramStatus, programStatusLabel } from "../../status";

function badgeClass(value: unknown): string {
  switch (normalizeProgramStatus(value)) {
    case "planned":
      return "border border-amber bg-white text-amber";
    case "ongoing":
      return "bg-mint text-green-900";
    case "completed":
      return "bg-green-800 text-white";
    case "cancelled":
      return "border border-danger/30 bg-danger/5 text-danger";
    default:
      return "border border-line bg-white text-muted";
  }
}

/**
 * Badge status mengikuti `.badge` / `.badge--*` pada prototype: tinggi 26px,
 * radius 3px, huruf kapital 11px, dan titik untuk status berjalan.
 */
export function ProgramStatusBadge({ status }: { status: unknown }) {
  const normalized = normalizeProgramStatus(status);

  return (
    <span
      className={`inline-flex h-[26px] w-fit items-center gap-1.5 self-start rounded-[3px] px-3 text-[11px] leading-none font-semibold tracking-[0.08em] whitespace-nowrap uppercase ${badgeClass(
        status,
      )}`}
    >
      {normalized === "ongoing" ? (
        <span
          className="size-1.5 rounded-full bg-green-800"
          aria-hidden="true"
        />
      ) : null}
      {programStatusLabel(status)}
    </span>
  );
}
