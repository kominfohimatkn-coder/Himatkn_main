import type {
  PublicOrganizationMember,
  PublicOrganizationResponse,
} from "./types";

/**
 * Logika murni halaman /struktur (pengganti `tier` di Design/assets/app.js).
 *
 * Aturan tier per divisi:
 * - Anggota dikelompokkan per `position.sort_order` (kecil = lebih tinggi).
 * - Kelompok pertama = lead.
 * - Kelompok kedua = vice, hanya bila divisi punya >= 3 kelompok jabatan;
 *   selain itu kelompok kedua masuk rest.
 * - Sisanya = rest.
 * Contoh: BPH → Ketua (lead), Wakil (vice), Sekretaris/Bendahara (rest).
 */

export type StructureTier = "lead" | "vice" | "rest";

export interface StructurePerson {
  id: number;
  name: string;
  role: string;
  photoUrl: string | null;
  tier: StructureTier;
}

export interface StructureDivision {
  /** String agar bisa dipakai langsung di URL (`?div=`) dan `<select>`. */
  id: string;
  name: string;
  lead: StructurePerson[];
  vice: StructurePerson[];
  rest: StructurePerson[];
  total: number;
}

export const UNASSIGNED_DIVISION_ID = "lainnya";

function buildDivision(
  id: string,
  name: string,
  members: PublicOrganizationMember[],
  positions: Map<number, { name: string; sort_order: number }>,
): StructureDivision {
  const groups = new Map<number, PublicOrganizationMember[]>();

  for (const member of members) {
    const order = positions.get(member.position_id)?.sort_order ?? Number.MAX_SAFE_INTEGER;
    const group = groups.get(order) ?? [];
    group.push(member);
    groups.set(order, group);
  }

  const orderedGroups = [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, group]) => group);

  const hasVice = orderedGroups.length >= 3;

  const toPerson =
    (tier: StructureTier) =>
    (member: PublicOrganizationMember): StructurePerson => ({
      id: member.id,
      name: member.name,
      role: positions.get(member.position_id)?.name ?? "Pengurus",
      photoUrl: member.photo_url,
      tier,
    });

  const lead = (orderedGroups[0] ?? []).map(toPerson("lead"));
  const vice = hasVice ? orderedGroups[1].map(toPerson("vice")) : [];
  const rest = orderedGroups
    .slice(hasVice ? 2 : 1)
    .flat()
    .map(toPerson("rest"));

  return { id, name, lead, vice, rest, total: members.length };
}

export function buildStructure(
  data: PublicOrganizationResponse,
): StructureDivision[] {
  const positions = new Map(
    data.positions.map((position) => [
      position.id,
      { name: position.name, sort_order: position.sort_order },
    ]),
  );

  const divisions = [...data.divisions]
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name))
    .map((division) =>
      buildDivision(
        String(division.id),
        division.name,
        data.members.filter((member) => member.division_id === division.id),
        positions,
      ),
    );

  const knownIds = new Set(data.divisions.map((division) => division.id));
  const unassigned = data.members.filter(
    (member) => member.division_id === null || !knownIds.has(member.division_id),
  );

  if (unassigned.length > 0) {
    divisions.push(
      buildDivision(UNASSIGNED_DIVISION_ID, "Lainnya", unassigned, positions),
    );
  }

  return divisions;
}
