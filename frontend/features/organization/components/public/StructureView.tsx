"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { StructureDivision } from "../../structure";
import { StructureTree } from "./StructureTree";

type View = "divisi" | "semua";

/** `.div-title` + garis 44px di bawahnya (Design/assets/style.css). */
function DivisionTitle({ children }: { children: string }) {
  return (
    <h2 className="mt-14 text-center font-serif text-[26px] leading-[1.25] font-bold text-green-900 after:mx-auto after:mt-4 after:block after:h-px after:w-11 after:bg-[#8FA3B8]">
      {children}
    </h2>
  );
}

const tabs: { value: View; label: string }[] = [
  { value: "divisi", label: "Per Divisi" },
  { value: "semua", label: "Lihat Semua" },
];

/** `renderStruktur()` di Design/assets/app.js. */
export function StructureView({
  divisions,
  periodName,
  initialView,
  initialDivisionId,
}: {
  divisions: StructureDivision[];
  periodName: string;
  initialView: View;
  initialDivisionId: string | null;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [divisionId, setDivisionId] = useState(
    divisions.some((division) => division.id === initialDivisionId)
      ? (initialDivisionId as string)
      : divisions[0].id,
  );

  const current =
    divisions.find((division) => division.id === divisionId) ?? divisions[0];

  const syncUrl = (nextView: View, nextDivisionId: string) => {
    const params = new URLSearchParams();
    if (nextView === "semua") params.set("view", "semua");
    else if (nextDivisionId !== divisions[0].id) params.set("div", nextDivisionId);
    const query = params.toString();
    router.replace(query ? `/struktur?${query}` : "/struktur", { scroll: false });
  };

  const changeView = (nextView: View) => {
    setView(nextView);
    syncUrl(nextView, divisionId);
  };

  const changeDivision = (nextDivisionId: string) => {
    setDivisionId(nextDivisionId);
    syncUrl(view, nextDivisionId);
  };

  return (
    <>
      <div className="flex justify-center">
        <div
          className="inline-flex max-w-full flex-nowrap justify-start gap-1 overflow-x-auto rounded-[4px] border border-line bg-paper p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden min-[641px]:flex-wrap min-[641px]:justify-center min-[641px]:overflow-visible"
          role="tablist"
          aria-label="Tampilan struktur"
        >
          {tabs.map((tab) => {
            const active = tab.value === view;

            return (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => changeView(tab.value)}
                className={`cursor-pointer rounded-[3px] px-4 py-[11px] text-xs font-semibold tracking-[0.1em] whitespace-nowrap uppercase transition-colors min-[641px]:px-[22px] min-[641px]:py-3 ${
                  active
                    ? "bg-green-800 text-white"
                    : "text-muted hover:text-green-900"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "divisi" ? (
        <>
          <div className="mx-auto mt-11 max-w-[400px] text-center">
            <label
              htmlFor="div-select"
              className="text-[10px] leading-[1.2] font-semibold tracking-[0.1em] text-muted uppercase"
            >
              Pilih Divisi
            </label>
            <div className="relative mt-2.5 text-left">
              <select
                id="div-select"
                value={current.id}
                onChange={(event) => changeDivision(event.target.value)}
                className="w-full cursor-pointer appearance-none rounded-[4px] border border-line bg-[#F7F9F8] pt-3 pr-10 pb-[26px] pl-3.5 text-sm/normal font-medium text-ink transition-colors hover:border-[#B9C6BF]"
              >
                {divisions.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name}
                  </option>
                ))}
              </select>
              <span
                className="pointer-events-none absolute top-[22px] right-[18px] size-[7px] rotate-45 border-r-[1.5px] border-b-[1.5px] border-muted"
                aria-hidden="true"
              />
              <span className="pointer-events-none absolute bottom-[9px] left-[15px] text-[11px] text-muted">
                {current.total} personil
              </span>
            </div>
          </div>

          <div aria-live="polite">
            <DivisionTitle>{current.name}</DivisionTitle>
            <StructureTree division={current} periodName={periodName} />
          </div>
        </>
      ) : (
        <div className="mt-5 flex flex-col gap-6" aria-live="polite">
          {divisions.map((division) => (
            <section key={division.id}>
              <DivisionTitle>{division.name}</DivisionTitle>
              <div className="mt-8">
                <StructureTree division={division} periodName={periodName} wide />
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
