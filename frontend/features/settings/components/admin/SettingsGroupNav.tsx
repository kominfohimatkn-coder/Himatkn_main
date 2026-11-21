"use client";

import type { SettingsGroup } from "./settings-utils";

interface SettingsGroupNavProps {
  groups: SettingsGroup[];
  activeGroup: string;
  dirtyCounts: Record<string, number>;
  onSelect: (groupKey: string) => void;
}

export default function SettingsGroupNav({
  groups,
  activeGroup,
  dirtyCounts,
  onSelect,
}: SettingsGroupNavProps) {
  if (groups.length === 0) return null;

  return (
    <nav
      aria-label="Bagian pengaturan situs"
      className="mt-6 border border-paper-line bg-paper"
    >
      <div className="border-b border-paper-line px-4 py-3">
        <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">
          Bagian website
        </p>
      </div>

      <div className="grid gap-1 p-2 sm:grid-cols-2 lg:grid-cols-4">
        {groups.map((group) => {
          const isActive = group.key === activeGroup;
          const dirtyCount = dirtyCounts[group.key] ?? 0;

          return (
            <button
              key={group.key}
              type="button"
              onClick={() => onSelect(group.key)}
              aria-current={isActive ? "true" : undefined}
              className={[
                "min-h-11 border px-3 py-2.5 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                isActive
                  ? "border-gold/60 bg-bg-light-2 text-bg-dark"
                  : "border-transparent text-ink-soft hover:border-paper-line hover:bg-bg-light hover:text-ink",
              ].join(" ")}
            >
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{group.label}</span>

                {dirtyCount > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center border border-gold/50 bg-gold/15 px-1.5 py-0.5 text-[11px] font-semibold text-ink">
                    {dirtyCount}
                  </span>
                )}
              </span>

              <span className="mt-1 block text-xs leading-5 text-ink-soft">
                {group.description}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
