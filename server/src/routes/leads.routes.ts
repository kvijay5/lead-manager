import { Router } from 'express';
import {
  createLead,
  listLeads,
  getLeadById,
  updateLead,
  deleteLead,
} from '../controllers/leads.controller';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createLeadSchema,
  idParamSchema,
  listLeadsQuerySchema,
  updateLeadSchema,
} from '../validation/lead.schemas';

const router = Router();

// Create lead
router.post(
  '/',
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

// Update lead by ID
router.put(
  '/:id',
  validate({ params: idParamSchema, body: updateLeadSchema }),
  asyncHandler(updateLead)
);

// Delete lead by ID
router.delete(
  '/:id',
  validate({ params: idParamSchema }),
  asyncHandler(deleteLead)
);

export default router;
