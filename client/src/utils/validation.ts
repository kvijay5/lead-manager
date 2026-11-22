import { LEAD_SOURCES, LEAD_STATUSES } from '../constants/leads';
import { CreateLeadPayload, LeadSource, LeadStatus } from '../types/lead';

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_CHARS_REGEX = /^[\d+\-()\s]+$/;

export const validateField = (
  field: keyof CreateLeadPayload,
  value: string | undefined
): string | undefined => {
  const val = value !== undefined ? String(value).trim() : '';

  switch (field) {
    case 'name':
      if (!val) return 'Name is required';
      if (val.length < 2) return 'Name must be at least 2 characters';
      if (val.length > 100) return 'Name cannot exceed 100 characters';
      return undefined;

    case 'email':
      if (!val) return 'Email is required';
      if (!EMAIL_REGEX.test(val)) return 'Invalid email address';
      if (val.length > 254) return 'Email cannot exceed 254 characters';
      return undefined;

    case 'phone':
      if (!val) return 'Phone number is required';
      if (val.length < 7) return 'Phone number must be at least 7 characters';
      if (val.length > 20) return 'Phone number cannot exceed 20 characters';
      if (!PHONE_CHARS_REGEX.test(val)) {
        return 'Phone number can only contain digits, spaces, and + - ( )';
      }
      const digitsCount = (val.match(/\d/g) || []).length;
      if (digitsCount < 7) return 'Phone number must contain at least 7 digits';
      return undefined;

    case 'company':
      if (!val) return 'Company is required';
      if (val.length > 100) return 'Company cannot exceed 100 characters';
      return undefined;

    case 'source':
      if (!val) return 'Source is required';
      if (!LEAD_SOURCES.includes(val as LeadSource)) {
        return 'Invalid source selected';
      }
      return undefined;

    case 'status':
      if (val && !LEAD_STATUSES.includes(val as LeadStatus)) {
        return 'Invalid status selected';
      }
      return undefined;

    default:
      return undefined;
  }
};

export const validateLeadForm = (
  data: Partial<CreateLeadPayload>
): FormErrors => {
  const errors: FormErrors = {};

  const nameError = validateField('name', data.name);
  if (nameError) errors.name = nameError;

  const emailError = validateField('email', data.email);
  if (emailError) errors.email = emailError;

  const phoneError = validateField('phone', data.phone);
  if (phoneError) errors.phone = phoneError;

  const companyError = validateField('company', data.company);
  if (companyError) errors.company = companyError;

  const sourceError = validateField('source', data.source);
  if (sourceError) errors.source = sourceError;

  if (data.status) {
    const statusError = validateField('status', data.status);
    if (statusError) errors.status = statusError;
  }

  return errors;
};
