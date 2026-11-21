import { Users } from "lucide-react";

import { PublicStateBox } from "@/components/public/PublicStateBox";

import type { StructureDivision, StructurePerson } from "../../../struktur-files/frontend/features/organization/structure";
import { PersonCard } from "./PersonCard";

/**
 * `.tree__link`: garis vertikal 28px, garis horizontal, dan label kecil
 * dengan titik 5px di atasnya (Design/assets/style.css).
 */
function TreeLink({ label }: { label: string }) {
  return (
    <div
      className="relative flex h-[46px] w-full max-w-[860px] items-end justify-center before:absolute before:top-2 before:left-1/2 before:h-7 before:border-l before:border-[#6E7A75] after:absolute after:inset-x-0 after:bottom-2 after:border-t after:border-line"
      aria-hidden="true"
    >
      <span className="relative z-10 bg-paper px-2 text-[10px] leading-4 font-semibold tracking-[0.12em] text-muted uppercase before:absolute before:-top-[5px] before:left-1/2 before:-ml-[2.5px] before:size-[5px] before:rounded-full before:bg-ink">
        {label}
      </span>
    </div>
  );
}

function TreeRow({
  people,
  periodName,
  wide,
}: {
  people: StructurePerson[];
  periodName: string;
  wide: boolean;
}) {
  return (
    <div
      className={`flex w-full flex-col items-center gap-3.5 min-[641px]:flex-row min-[641px]:flex-wrap min-[641px]:items-stretch min-[641px]:justify-center ${wide ? "max-w-[1060px]" : "max-w-[780px]"}`}
    >
      {people.map((person) => (
        <PersonCard key={person.id} person={person} periodName={periodName} />
      ))}
    </div>
  );
}

/** `divisionTree()` di Design/assets/app.js. */
export function StructureTree({
  division,
  periodName,
  wide = false,
}: {
  division: StructureDivision;
  periodName: string;
  wide?: boolean;
}) {
  if (division.total === 0) {
    return (
      <PublicStateBox
        icon={<Users className="size-5.5" />}
        label={division.name}
        title="Data pengurus belum tersedia"
      >
        Nama pengurus divisi ini belum diunggah. Hubungi Divisi Minfo jika ada
        data yang perlu ditambahkan.
      </PublicStateBox>
    );
  }

  return (
    <div className="mt-10 flex flex-col items-center">
      {division.lead.length > 0 ? (
        <TreeRow people={division.lead} periodName={periodName} wide={wide} />
      ) : null}

      {division.vice.length > 0 ? (
        <>
          <TreeLink label="Koordinasi" />
          <TreeRow people={division.vice} periodName={periodName} wide={wide} />
        </>
      ) : null}

      {division.rest.length > 0 ? (
        <>
          <TreeLink label={division.lead.length > 0 ? "Pelaksana" : "Anggota"} />
          <TreeRow people={division.rest} periodName={periodName} wide={wide} />
        </>
      ) : null}
    </div>
  );
}
