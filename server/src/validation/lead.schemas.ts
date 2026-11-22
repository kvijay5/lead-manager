import { z } from 'zod';
import {
  LEAD_SOURCES,
  LEAD_STATUSES,
  SORT_FIELDS,
  SORT_ORDERS,
} from '../constants/leads';

export const idParamSchema = z.object({
  id: z.string().uuid({ message: 'Invalid ID format, must be a valid UUID' }),
});

export const phoneSchema = z
  .string({ required_error: 'Phone number is required' })
  .trim()
  .min(7, 'Phone number must be at least 7 characters')
  .max(20, 'Phone number cannot exceed 20 characters')
  .regex(
    /^[\d+\-()\s]+$/,
    'Phone number can only contain digits, spaces, and + - ( )'
  )
  .refine((val) => (val.match(/\d/g) || []).length >= 7, {
    message: 'Phone number must contain at least 7 digits',
  });

export const createLeadSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address')
    .max(254, 'Email cannot exceed 254 characters')
    .toLowerCase(),
  phone: phoneSchema,
  company: z
    .string({ required_error: 'Company is required' })
    .trim()
    .min(1, 'Company is required')
    .max(100, 'Company cannot exceed 100 characters'),
  source: z.enum(LEAD_SOURCES, {
    errorMap: () => ({
      message: `Source must be one of: ${LEAD_SOURCES.join(', ')}`,
    }),
  }),
  status: z
    .enum(LEAD_STATUSES, {
      errorMap: () => ({
        message: `Status must be one of: ${LEAD_STATUSES.join(', ')}`,
      }),
    })
    .default('NEW'),
});

export const updateLeadSchema = createLeadSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

export const listLeadsQuerySchema = z.object({
  page: z.preprocess(
    (val) => (val === undefined || val === '' ? 1 : Number(val)),
    z
      .number({ invalid_type_error: 'Page must be a number' })
      .int('Page must be an integer')
      .min(1, 'Page must be greater than or equal to 1')
  ),
  limit: z.preprocess(
    (val) => (val === undefined || val === '' ? 10 : Number(val)),
    z
      .number({ invalid_type_error: 'Limit must be a number' })
      .int('Limit must be an integer')
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
  ),
  search: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z
      .string()
      .trim()
      .max(100, 'Search query cannot exceed 100 characters')
      .optional()
  ),
  status: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.enum(LEAD_STATUSES).optional()
  ),
  sortBy: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.enum(SORT_FIELDS).default('createdAt')
  ),
  order: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.enum(SORT_ORDERS).default('desc')
  ),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type ListLeadsQuery = z.infer<typeof listLeadsQuerySchema>;
