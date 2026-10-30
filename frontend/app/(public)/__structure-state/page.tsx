import { StructurePage } from "@/components/public/StructurePage";
import type { PublicOrganizationResponse } from "@/types/organization";

const period = {
  id: 1,
  name: "2025/2026",
};

const states: Record<
  string,
  { data: PublicOrganizationResponse | null; hasError: boolean }
> = {
  error: {
    data: null,
    hasError: true,
  },
  "no-period": {
    data: {
      period: null,
      divisions: [],
      members: [],
      positions: [],
    },
    hasError: false,
  },
  "no-divisions": {
    data: {
      period,
      divisions: [],
      members: [],
      positions: [],
    },
    hasError: false,
  },
  "empty-members": {
    data: {
      period,
      divisions: [
        {
          id: 1,
          name: "Divisi Uji",
          description: "Data sementara untuk validasi state.",
        },
      ],
      members: [],
      positions: [],
    },
    hasError: false,
  },
};

export default async function StructureStateTestPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state = "error" } = await searchParams;
  const selected = states[state] ?? states.error;

  return (
    <StructurePage data={selected.data} hasError={selected.hasError} />
  );
}
