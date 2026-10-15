import { apiFetch } from "../api/client";

import type {
  AdminDivision,
  AdminPeriod,
  OrganizationListResponse,
} from "@/types/organization";

interface RequestOptions {
  signal?: AbortSignal;
}

export function getAdminPeriods(
  options: RequestOptions = {},
): Promise<OrganizationListResponse<AdminPeriod>> {
  return apiFetch<OrganizationListResponse<AdminPeriod>>(
    "/admin/organization/periods",
    {
      method: "GET",
      signal: options.signal,
    },
  );
}

export function getAdminDivisions(
  periodId: number,
  options: RequestOptions = {},
): Promise<OrganizationListResponse<AdminDivision>> {
  const query = new URLSearchParams({
    period_id: String(periodId),
  });

  return apiFetch<OrganizationListResponse<AdminDivision>>(
    `/admin/organization/divisions?${query.toString()}`,
    {
      method: "GET",
      signal: options.signal,
    },
  );
}