export const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'LOST'] as const;
export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const LEAD_SOURCES = [
  'WEBSITE',
  'REFERRAL',
  'LINKEDIN',
  'COLD_CALL',
  'EMAIL_CAMPAIGN',
  'EVENT',
  'OTHER',
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const SORT_FIELDS = ['name', 'createdAt', 'status', 'company'] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_ORDERS = ['asc', 'desc'] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];
