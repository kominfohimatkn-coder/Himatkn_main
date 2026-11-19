import type { NewsStatus, NewsTag } from "../../types";

const STATUS_LABELS: Record<NewsStatus, string> = {
  draft: "Draft",
  published: "Terbit",
  archived: "Arsip",
};

const STATUS_COLORS: Record<NewsStatus, string> = {
  draft: "border-gold/40 bg-gold/15 text-ink",
  published: "border-bg-dark/20 bg-bg-dark/10 text-bg-dark",
  archived: "border-paper-line bg-bg-light-2 text-ink-soft",
};

export function StatusBadge({
  status,
}: {
  status: NewsStatus;
}) {
  return (
    <span
      className={`inline-flex items-center border px-2.5 py-1 text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function NewsTags({
  tags,
}: {
  tags: NewsTag[];
}) {
  if (tags.length === 0) {
    return (
      <span className="text-xs text-ink-soft/75">
        Tanpa tag
      </span>
    );
  }

  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1">
      {tags.map((tag) => (
        <li
          key={tag.id}
          className="text-xs leading-5 text-ink-soft"
        >
          {tag.name}
        </li>
      ))}
    </ul>
  );
}

export function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
    />
  );
}