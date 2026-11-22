export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'LOST';

export type LeadSource =
  | 'WEBSITE'
  | 'REFERRAL'
  | 'LINKEDIN'
  | 'COLD_CALL'
  | 'EMAIL_CAMPAIGN'
  | 'EVENT'
  | 'OTHER';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LeadListResponse {
  data: Lead[];
  meta: PaginationMeta;
}

export interface LeadSingleResponse {
  data: Lead;
}

export interface CreateLeadPayload {
  name: string;
  email: string;
  phone: string;
  company: string;
  source: LeadSource;
  status?: LeadStatus;
}

export interface UpdateLeadPayload {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: LeadSource;
  status?: LeadStatus;
}

export interface ListLeadsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus | '';
  sortBy?: 'name' | 'createdAt' | 'status' | 'company';
  order?: 'asc' | 'desc';
}
