import { Router } from 'express';
import {
  createLead,
  listLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from '../controllers/leads.controller';
import { validate } from '../middleware/validate';
import { writeRateLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createLeadSchema,
  idParamSchema,
  listLeadsQuerySchema,
  updateLeadSchema,
} from '../validation/lead.schemas';

const router = Router();

// Create lead (rate-limited write)
router.post(
  '/',
  writeRateLimiter,
  validate({ body: createLeadSchema }),
  asyncHandler(createLead)
);

// List leads with pagination, search, status filter, and sorting
router.get(
  '/',
  validate({ query: listLeadsQuerySchema }),
  asyncHandler(listLeads)
);

// Get lead by ID
router.get(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(getLeadById)
);

// Update lead by ID (rate-limited write)
router.put(
  '/:id',
  writeRateLimiter,
  validate({ params: idParamSchema, body: updateLeadSchema }),
  asyncHandler(updateLead)
);

// Delete lead by ID (rate-limited write)
router.delete(
  '/:id',
  writeRateLimiter,
  validate({ params: idParamSchema }),
  asyncHandler(deleteLead)
);

export default router;
