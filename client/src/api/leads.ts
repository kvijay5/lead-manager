import {
  CreateLeadPayload,
  LeadListResponse,
  LeadSingleResponse,
  ListLeadsParams,
  UpdateLeadPayload,
} from '../types/lead';
import { request } from './http';

export async function getLeads(
  params: ListLeadsParams = {},
  signal?: AbortSignal
): Promise<LeadListResponse> {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.search && params.search.trim()) {
    query.set('search', params.search.trim());
  }
  if (params.status) query.set('status', params.status);
  if (params.sortBy) query.set('sortBy', params.sortBy);
  if (params.order) query.set('order', params.order);

  const queryString = query.toString();
  const endpoint = queryString ? `/leads?${queryString}` : '/leads';

  return request<LeadListResponse>(endpoint, { signal });
}

export async function getLead(
  id: string,
  signal?: AbortSignal
): Promise<LeadSingleResponse> {
  return request<LeadSingleResponse>(`/leads/${id}`, { signal });
}

export async function createLead(
  data: CreateLeadPayload
): Promise<LeadSingleResponse> {
  return request<LeadSingleResponse>('/leads', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateLead(
  id: string,
  data: UpdateLeadPayload
): Promise<LeadSingleResponse> {
  return request<LeadSingleResponse>(`/leads/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteLead(id: string): Promise<void> {
  await request<void>(`/leads/${id}`, {
    method: 'DELETE',
  });
}
