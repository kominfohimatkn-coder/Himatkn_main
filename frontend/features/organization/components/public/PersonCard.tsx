"use client";

/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

import { resolveMediaUrl } from "@/lib/media/api";

import type { StructurePerson, StructureTier } from "../../structure";

/** `.role`, `.role--lead`, `.role--vice` di Design/assets/style.css. */
const roleClasses: Record<StructureTier, string> = {
  lead: "border-green-950 bg-green-950 text-white",
  vice: "border-ink text-ink",
  rest: "border-green-800 text-green-800",
};

/** `ICON.avatar` di Design/assets/app.js. */
function AvatarPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" className="size-full" aria-hidden="true">
      <rect width="100" height="100" fill="#E2E2E2" />
      <circle cx="50" cy="38" r="19" fill="#474747" />
      <path d="M14 100c2-24 17-37 36-37s34 13 36 37z" fill="#474747" />
    </svg>
  );
}

function Avatar({ photoUrl }: { photoUrl: string | null }) {
  const [failed, setFailed] = useState(false);
  const src = resolveMediaUrl(photoUrl);

  return (
    <div className="mx-auto mb-[18px] size-[100px] overflow-hidden rounded-full bg-[#E2E2E2]">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-cover"
        />
      ) : (
        <AvatarPlaceholder />
      )}
    </div>
  );
}

/** `.person` di Design/assets/style.css (lebar 250px, mobile penuh maks 330px). */
export function PersonCard({
  person,
  periodName,
}: {
  person: StructurePerson;
  periodName: string;
}) {
  return (
    <article className="w-full max-w-[330px] rounded-[3px] border border-line bg-white px-[18px] pt-5 pb-[22px] text-center transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-[3px] hover:border-[#B9C6BF] hover:shadow-[0_6px_20px_rgba(6,38,27,0.06)] min-[641px]:w-[250px] min-[641px]:max-w-none">
      <Avatar key={person.photoUrl ?? "none"} photoUrl={person.photoUrl} />
      <span
        className={`inline-block rounded-[3px] border px-2.5 py-1 text-[9px] leading-[1.2] font-bold tracking-[0.1em] uppercase ${roleClasses[person.tier]}`}
      >
        {person.role}
      </span>
      <h3 className="mt-2.5 font-serif text-[15px] leading-[1.35] font-bold text-green-900">
        {person.name}
      </h3>
      <p className="mt-1 text-[9px] font-semibold tracking-[0.12em] text-[#8A9590]">
        {periodName}
      </p>
    </article>
  );
}
