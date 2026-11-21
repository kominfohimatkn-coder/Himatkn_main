import type {
  PublicOrganizationDivision,
  PublicOrganizationMember,
  PublicOrganizationPosition,
  PublicOrganizationResponse,
} from "./types";

export type MemberWithPosition = PublicOrganizationMember & {
  position: PublicOrganizationPosition;
};

export type DivisionTreeTier = {
  label: string | null;
  type: "lead" | "vice" | "rest";
  members: MemberWithPosition[];
};

export type DivisionTree = {
  id: number | "other";
  name: string;
  members: MemberWithPosition[];
  tiers: DivisionTreeTier[];
};

export function buildDivisionTree(
  data: PublicOrganizationResponse,
): DivisionTree[] {
  const { divisions, members, positions } = data;
  const positionMap = new Map(positions.map((p) => [p.id, p]));

  const getMembersForDivision = (divisionId: number | null) => {
    return members
      .filter((m) => m.division_id === divisionId)
      .map((m) => ({
        ...m,
        position: positionMap.get(m.position_id)!,
      }))
      .filter((m) => !!m.position);
  };

  const processTiers = (
    divMembers: MemberWithPosition[],
  ): DivisionTreeTier[] => {
    if (divMembers.length === 0) return [];

    // Group by position sort_order
    const groups: Map<number, MemberWithPosition[]> = new Map();
    divMembers.forEach((m) => {
      const order = m.position.sort_order;
      if (!groups.has(order)) groups.set(order, []);
      groups.get(order)!.push(m);
    });

    const sortedOrders = Array.from(groups.keys()).sort((a, b) => a - b);
    const tiers: DivisionTreeTier[] = [];

    // Kelompok pertama = lead
    const leadOrder = sortedOrders[0];
    const leadMembers = groups.get(leadOrder)!.sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    tiers.push({
      label: null,
      type: "lead",
      members: leadMembers,
    });

    let restMembers: MemberWithPosition[] = [];

    if (sortedOrders.length >= 3) {
      // Kelompok kedua = vice
      const viceOrder = sortedOrders[1];
      const viceMembers = groups.get(viceOrder)!.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
      tiers.push({
        label: "Koordinasi",
        type: "vice",
        members: viceMembers,
      });

      // Sisanya = rest
      for (let i = 2; i < sortedOrders.length; i++) {
        restMembers.push(...groups.get(sortedOrders[i])!);
      }
    } else if (sortedOrders.length === 2) {
      // Kelompok kedua masuk rest
      restMembers.push(...groups.get(sortedOrders[1])!);
    }

    if (restMembers.length > 0) {
      // Urut sort_order jabatan lalu nama
      restMembers.sort((a, b) => {
        if (a.position.sort_order !== b.position.sort_order) {
          return a.position.sort_order - b.position.sort_order;
        }
        return a.name.localeCompare(b.name);
      });

      tiers.push({
        label: "Pelaksana",
        type: "rest",
        members: restMembers,
      });
    }

    return tiers;
  };

  const tree: DivisionTree[] = divisions.map((div) => {
    const divMembers = getMembersForDivision(div.id);
    return {
      id: div.id,
      name: div.name,
      members: divMembers,
      tiers: processTiers(divMembers),
    };
  });

  const otherMembers = getMembersForDivision(null);
  if (otherMembers.length > 0) {
    tree.push({
      id: "other",
      name: "Lainnya",
      members: otherMembers,
      tiers: processTiers(otherMembers),
    });
  }

  return tree;
}
