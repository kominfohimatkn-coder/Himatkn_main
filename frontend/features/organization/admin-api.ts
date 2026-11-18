import { apiFetch } from "@/lib/api/client";

import type {
  AdminDivision,
  AdminMember,
  AdminPeriod,
  AdminPosition,
  DivisionCopyPayload,
  DivisionCopyResponse,
  DivisionCreatePayload,
  DivisionDeleteResponse,
  DivisionUpdatePayload,
  MemberCreatePayload,
  MemberUpdatePayload,
  OrganizationListFilter,
  OrganizationListResponse,
  PeriodActivateResponse,
  PeriodCreatePayload,
  PeriodDeleteResponse,
  PeriodUpdatePayload,
} from "./types";

interface RequestOptions {
  signal?: AbortSignal;
}

function buildOrganizationQuery(filter: OrganizationListFilter): string {
  const query = new URLSearchParams();

  if (filter.period_id !== undefined) {
    query.set("period_id", String(filter.period_id));
  }

  const qs = query.toString();
  return qs ? `?${qs}` : "";
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

export function createAdminPeriod(
  payload: PeriodCreatePayload,
): Promise<AdminPeriod> {
  return apiFetch<AdminPeriod>("/admin/organization/periods", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminPeriod(
  periodId: number,
  payload: PeriodUpdatePayload,
): Promise<AdminPeriod> {
  return apiFetch<AdminPeriod>(`/admin/organization/periods/${periodId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminPeriod(
  periodId: number,
): Promise<PeriodDeleteResponse> {
  return apiFetch<PeriodDeleteResponse>(
    `/admin/organization/periods/${periodId}`,
    {
      method: "DELETE",
    },
  );
}

export function activateAdminPeriod(
  periodId: number,
): Promise<PeriodActivateResponse> {
  return apiFetch<PeriodActivateResponse>(
    `/admin/organization/periods/${periodId}/activate`,
    {
      method: "POST",
    },
  );
}

export function getAdminDivisions(
  periodId?: number,
  options: RequestOptions = {},
): Promise<OrganizationListResponse<AdminDivision>> {
  const suffix = buildOrganizationQuery({ period_id: periodId });

  return apiFetch<OrganizationListResponse<AdminDivision>>(
    `/admin/organization/divisions${suffix}`,
    {
      method: "GET",
      signal: options.signal,
    },
  );
}

export function createAdminDivision(
  payload: DivisionCreatePayload,
): Promise<AdminDivision> {
  return apiFetch<AdminDivision>("/admin/organization/divisions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminDivision(
  divisionId: number,
  payload: DivisionUpdatePayload,
): Promise<AdminDivision> {
  return apiFetch<AdminDivision>(
    `/admin/organization/divisions/${divisionId}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  );
}

export function deleteAdminDivision(
  divisionId: number,
): Promise<DivisionDeleteResponse> {
  return apiFetch<DivisionDeleteResponse>(
    `/admin/organization/divisions/${divisionId}`,
    {
      method: "DELETE",
    },
  );
}

export function copyAdminDivisions(
  periodId: number,
  payload: DivisionCopyPayload,
): Promise<DivisionCopyResponse> {
  return apiFetch<DivisionCopyResponse>(
    `/admin/organization/periods/${periodId}/divisions/copy`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export function getAdminPositions(
  options: RequestOptions = {},
): Promise<OrganizationListResponse<AdminPosition>> {
  return apiFetch<OrganizationListResponse<AdminPosition>>(
    "/admin/organization/positions",
    {
      method: "GET",
      signal: options.signal,
    },
  );
}

export function getAdminMembers(
  filter: OrganizationListFilter = {},
  options: RequestOptions = {},
): Promise<OrganizationListResponse<AdminMember>> {
  const suffix = buildOrganizationQuery(filter);

  return apiFetch<OrganizationListResponse<AdminMember>>(
    `/admin/organization/members${suffix}`,
    {
      method: "GET",
      signal: options.signal,
    },
  );
}

export function createAdminMember(
  payload: MemberCreatePayload,
): Promise<AdminMember> {
  return apiFetch<AdminMember>("/admin/organization/members", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateAdminMember(
  memberId: number,
  payload: MemberUpdatePayload,
): Promise<AdminMember> {
  return apiFetch<AdminMember>(`/admin/organization/members/${memberId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteAdminMember(memberId: number): Promise<void> {
  return apiFetch<void>(`/admin/organization/members/${memberId}`, {
    method: "DELETE",
  });
}
