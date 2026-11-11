"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { PublicImage } from "@/components/public/PublicImage";
import type {
  PublicOrganizationMember,
  PublicOrganizationResponse,
} from "@/types/organization";

type StructureDirectoryProps = {
  data: PublicOrganizationResponse;
};

type ViewMode = "division" | "all";

type DivisionGroup = {
  key: string;
  name: string;
  description: string | null;
  members: PublicOrganizationMember[];
};

type PositionLookup = Map<number, string>;

function buildDivisionGroups(
  data: PublicOrganizationResponse,
): DivisionGroup[] {
  const divisions = data.divisions ?? [];
  const members = data.members ?? [];
  const knownDivisionIds = new Set(
    divisions.map((division) => division.id),
  );
  const membersByDivision = new Map<number, PublicOrganizationMember[]>();
  const unassignedMembers: PublicOrganizationMember[] = [];

  for (const member of members) {
    if (
      member.division_id === null ||
      !knownDivisionIds.has(member.division_id)
    ) {
      unassignedMembers.push(member);
      continue;
    }

    const divisionMembers =
      membersByDivision.get(member.division_id) ?? [];
    divisionMembers.push(member);
    membersByDivision.set(member.division_id, divisionMembers);
  }

  const groups = divisions.map((division) => ({
    key: `division-${division.id}`,
    name: division.name,
    description: division.description,
    members: membersByDivision.get(division.id) ?? [],
  }));

  if (unassignedMembers.length > 0) {
    groups.push({
      key: "unassigned",
      name: "Tanpa divisi",
      description:
        "Respons API tidak menyertakan divisi untuk anggota berikut.",
      members: unassignedMembers,
    });
  }

  return groups;
}

function isBphGroup(group: DivisionGroup): boolean {
  return /\bbph\b|badan pengurus harian/i.test(group.name);
}

function isAdvisorGroup(group: DivisionGroup): boolean {
  return /\bpembimbing\b/i.test(group.name);
}

function getInitialGroupKey(groups: DivisionGroup[]): string {
  const bphGroup = groups.find(isBphGroup);

  if (bphGroup) {
    return bphGroup.key;
  }

  return (
    groups.find((group) => group.members.length > 0) ?? groups[0]
  )?.key ?? "";
}

function getPositionName(
  positionsById: PositionLookup,
  member: PublicOrganizationMember,
): string {
  return positionsById.get(member.position_id) ?? "Jabatan tidak tersedia";
}

function getBphCategory(
  positionName: string,
): "ketua" | "koordinasi" | "pelaksana" | null {
  if (/^ketua himpunan$/i.test(positionName)) {
    return "ketua";
  }

  if (/wakil ketua/i.test(positionName)) {
    return "koordinasi";
  }

  if (/^(sekretaris|bendahara)/i.test(positionName)) {
    return "pelaksana";
  }

  return null;
}

function getDescription(group: DivisionGroup): string | null {
  const description = group.description?.trim();
  return description ? description : null;
}

function MemberCard({
  member,
  positionsById,
  periodName,
}: {
  member: PublicOrganizationMember;
  positionsById: PositionLookup;
  periodName: string;
}) {
  return (
    <article className="structure-card">
      <PublicImage
        src={member.photo_url}
        alt={member.name}
        className="aspect-square w-full"
      />

      <div className="structure-card__body">
        <p className="structure-card__role">
          {getPositionName(positionsById, member)}
        </p>
        {periodName ? (
          <p className="structure-card__period">{periodName}</p>
        ) : null}
        <p className="structure-card__name">{member.name}</p>
      </div>
    </article>
  );
}

function MemberGrid({
  members,
  positionsById,
  periodName,
}: {
  members: PublicOrganizationMember[];
  positionsById: PositionLookup;
  periodName: string;
}) {
  const gridClasses = [
    "grid gap-3 sm:gap-4",
    members.length === 1
      ? "grid-cols-[minmax(0,11.5rem)] justify-center"
      : "grid-cols-2 min-[640px]:grid-cols-3 min-[900px]:grid-cols-4",
  ].join(" ");

  return (
    <div className={gridClasses}>
      {members.map((member) => (
        <MemberCard
          key={member.id}
          member={member}
          positionsById={positionsById}
          periodName={periodName}
        />
      ))}
    </div>
  );
}

function DivisionEmpty() {
  return (
    <div className="structure-division-empty">
      <p className="structure-eyebrow">Divisi</p>
      <h3>Belum ada anggota di divisi ini.</h3>
      <p>
        Data divisi tersedia, tetapi belum ada anggota yang terhubung ke
        divisi tersebut.
      </p>
    </div>
  );
}

function BphLevel({
  label,
  members,
  positionsById,
  periodName,
}: {
  label: string;
  members: PublicOrganizationMember[];
  positionsById: PositionLookup;
  periodName: string;
}) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="structure-bph__level">
      <p className="structure-bph__label">{label}</p>
      <div className="structure-bph__grid" data-count={members.length}>
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            positionsById={positionsById}
            periodName={periodName}
          />
        ))}
      </div>
    </div>
  );
}

function BphHierarchy({
  members,
  positionsById,
  periodName,
}: {
  members: PublicOrganizationMember[];
  positionsById: PositionLookup;
  periodName: string;
}) {
  const lead: PublicOrganizationMember[] = [];
  const coordination: PublicOrganizationMember[] = [];
  const executor: PublicOrganizationMember[] = [];
  const other: PublicOrganizationMember[] = [];

  for (const member of members) {
    const category = getBphCategory(
      getPositionName(positionsById, member),
    );

    if (category === "ketua") {
      lead.push(member);
    } else if (category === "koordinasi") {
      coordination.push(member);
    } else if (category === "pelaksana") {
      executor.push(member);
    } else {
      other.push(member);
    }
  }

  const hasStructuredCategory =
    lead.length + coordination.length + executor.length > 0;

  if (!hasStructuredCategory) {
    return (
      <MemberGrid
        members={members}
        positionsById={positionsById}
        periodName={periodName}
      />
    );
  }

  const hasFollowingMembers =
    coordination.length + executor.length + other.length > 0;

  return (
    <div className="structure-bph">
      {lead.length > 0 ? (
        <div className="structure-bph__level">
          <p className="structure-bph__label">Ketua Himpunan</p>
          <div className="structure-bph__lead">
            {lead.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                positionsById={positionsById}
                periodName={periodName}
              />
            ))}
          </div>
        </div>
      ) : null}

      {lead.length > 0 && hasFollowingMembers ? (
        <div className="structure-bph__connector" aria-hidden="true" />
      ) : null}

      <BphLevel
        label="Koordinasi"
        members={coordination}
        positionsById={positionsById}
        periodName={periodName}
      />
      <BphLevel
        label="Pelaksana"
        members={executor}
        positionsById={positionsById}
        periodName={periodName}
      />

      {other.length > 0 ? (
        <div
          className="structure-bph__grid"
          data-count={other.length}
          aria-label="Anggota BPH dengan jabatan lain"
        >
          {other.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              positionsById={positionsById}
              periodName={periodName}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DirectoryBlock({
  group,
  positionsById,
  periodName,
  centered = false,
}: {
  group: DivisionGroup;
  positionsById: PositionLookup;
  periodName: string;
  centered?: boolean;
}) {
  const description = getDescription(group);
  const headingId = `structure-block-${group.key}`;

  return (
    <section
      className={`structure-directory-block${
        centered ? " structure-directory-block--centered" : ""
      }`}
      aria-labelledby={headingId}
    >
      <div className="structure-directory-block__head">
        <div>
          <h2 id={headingId}>{group.name}</h2>
          <p className="structure-directory-block__count">
            {group.members.length} personel
          </p>
          {description ? (
            <p className="structure-directory-block__description">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      {group.members.length > 0 ? (
        isBphGroup(group) ? (
          <BphHierarchy
            members={group.members}
            positionsById={positionsById}
            periodName={periodName}
          />
        ) : (
          <MemberGrid
            members={group.members}
            positionsById={positionsById}
            periodName={periodName}
          />
        )
      ) : (
        <DivisionEmpty />
      )}
    </section>
  );
}

function DivisionAccordion({
  group,
  positionsById,
  periodName,
  isOpen,
  onToggle,
}: {
  group: DivisionGroup;
  positionsById: PositionLookup;
  periodName: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const buttonId = `structure-accordion-${group.key}`;
  const panelId = `${buttonId}-panel`;
  const description = getDescription(group);

  return (
    <div className="structure-accordion">
      <h2 className="structure-accordion__heading">
        <button
          id={buttonId}
          type="button"
          className="structure-accordion__trigger"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
        >
          <span className="structure-accordion__name">{group.name}</span>
          <span className="structure-accordion__meta">
            {group.members.length} personel
          </span>
          <ChevronDown
            className={`structure-accordion__icon${
              isOpen ? " is-open" : ""
            }`}
            aria-hidden="true"
          />
        </button>
      </h2>

      {isOpen ? (
        <div
          id={panelId}
          role="region"
          aria-labelledby={buttonId}
          className="structure-accordion__panel"
        >
          {description ? (
            <p className="structure-accordion__description">{description}</p>
          ) : null}

          {group.members.length > 0 ? (
            <MemberGrid
              members={group.members}
              positionsById={positionsById}
              periodName={periodName}
            />
          ) : (
            <DivisionEmpty />
          )}
        </div>
      ) : null}
    </div>
  );
}

export function StructureDirectory({ data }: StructureDirectoryProps) {
  const periodName = data.period?.name ?? "";
  const groups = buildDivisionGroups(data);
  const positionsById: PositionLookup = new Map(
    (data.positions ?? []).map((position) => [position.id, position.name]),
  );
  const [mode, setMode] = useState<ViewMode>("division");
  const [selectedKey, setSelectedKey] = useState(() =>
    getInitialGroupKey(groups),
  );
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const selectedGroup =
    groups.find((group) => group.key === selectedKey) ?? groups[0] ?? null;
  const advisorGroup = groups.find(isAdvisorGroup);
  const bphGroup = groups.find(isBphGroup);
  const directoryGroups = groups.filter(
    (group) =>
      group.key !== advisorGroup?.key && group.key !== bphGroup?.key,
  );

  function toggleAccordion(key: string) {
    setOpenKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  }

  if (!selectedGroup) {
    return (
      <div className="structure-page-state">
        <p className="structure-eyebrow">Divisi</p>
        <h2>Belum ada divisi pada periode ini.</h2>
        <p>
          Periode aktif tersedia, tetapi daftar divisi belum diisi.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="structure-controls">
        <fieldset className="structure-mode">
          <legend className="sr-only">
            Mode tampilan susunan kepengurusan
          </legend>

          <div className="structure-mode__control">
            <label className="structure-mode__option">
              <input
                className="sr-only structure-mode__input"
                type="radio"
                name="structure-view"
                value="division"
                checked={mode === "division"}
                aria-controls="structure-results"
                onChange={() => setMode("division")}
              />
              <span className="structure-mode__label">Per Divisi</span>
            </label>

            <label className="structure-mode__option">
              <input
                className="sr-only structure-mode__input"
                type="radio"
                name="structure-view"
                value="all"
                checked={mode === "all"}
                aria-controls="structure-results"
                onChange={() => setMode("all")}
              />
              <span className="structure-mode__label">Lihat Semua</span>
            </label>
          </div>
        </fieldset>

        {mode === "division" ? (
          <div className="structure-select">
            <label
              htmlFor="division-select"
              className="structure-select__label"
            >
              Pilih Divisi
            </label>
            <select
              id="division-select"
              className="structure-select__control"
              value={selectedGroup.key}
              onChange={(event) => setSelectedKey(event.target.value)}
            >
              {groups.map((group) => (
                <option key={group.key} value={group.key}>
                  {group.name} — {group.members.length} personel
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {mode === "division" ? (
        <section
          id="structure-results"
          className="structure-selected"
          aria-label="Anggota divisi terpilih"
        >
          <div className="structure-selected__head">
            <p className="structure-eyebrow">Divisi terpilih</p>
            <h2>{selectedGroup.name}</h2>
            <p className="structure-selected__count">
              {selectedGroup.members.length} personel
            </p>
            {getDescription(selectedGroup) ? (
              <p className="structure-selected__description">
                {getDescription(selectedGroup)}
              </p>
            ) : null}
          </div>

          {selectedGroup.members.length > 0 ? (
            isBphGroup(selectedGroup) ? (
              <BphHierarchy
                members={selectedGroup.members}
                positionsById={positionsById}
                periodName={periodName}
              />
            ) : (
              <MemberGrid
                members={selectedGroup.members}
                positionsById={positionsById}
                periodName={periodName}
              />
            )
          ) : (
            <DivisionEmpty />
          )}
        </section>
      ) : (
        <section
          id="structure-results"
          className="structure-all"
          aria-label="Seluruh kepengurusan"
        >
          {advisorGroup ? (
            <DirectoryBlock
              group={advisorGroup}
              positionsById={positionsById}
              periodName={periodName}
              centered
            />
          ) : null}

          {bphGroup ? (
            <DirectoryBlock
              group={bphGroup}
              positionsById={positionsById}
              periodName={periodName}
              centered
            />
          ) : null}

          {directoryGroups.length > 0 ? (
            <div className="structure-accordions">
              {directoryGroups.map((group) => (
                <DivisionAccordion
                  key={group.key}
                  group={group}
                  positionsById={positionsById}
                  periodName={periodName}
                  isOpen={openKeys.includes(group.key)}
                  onToggle={() => toggleAccordion(group.key)}
                />
              ))}
            </div>
          ) : null}
        </section>
      )}
    </div>
  );
}
