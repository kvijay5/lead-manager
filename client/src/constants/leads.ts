import { LeadSource, LeadStatus } from '../types/lead';

export const LEAD_STATUSES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'LOST',
];

export const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  QUALIFIED: 'Qualified',
  LOST: 'Lost',
};

export const STATUS_STYLES: Record<
  LeadStatus,
  { bg: string; text: string; dot: string; border: string }
> = {
  NEW: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
    border: 'border-blue-200',
  },
  CONTACTED: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
    border: 'border-amber-200',
  },
  QUALIFIED: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
    border: 'border-emerald-200',
  },
  LOST: {
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-500',
    border: 'border-rose-200',
  },
};

export const LEAD_SOURCES: LeadSource[] = [
  'WEBSITE',
  'REFERRAL',
  'LINKEDIN',
  'COLD_CALL',
  'EMAIL_CAMPAIGN',
  'EVENT',
  'OTHER',
];

export const SOURCE_LABELS: Record<LeadSource, string> = {
  WEBSITE: 'Website',
  REFERRAL: 'Referral',
  LINKEDIN: 'LinkedIn',
  COLD_CALL: 'Cold Call',
  EMAIL_CAMPAIGN: 'Email Campaign',
  EVENT: 'Event',
  OTHER: 'Other',
};
