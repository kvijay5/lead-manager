import { Router } from 'express';
import { login, signup } from '../controllers/auth.controller';
import { writeRateLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { loginSchema, signupSchema } from '../validation/auth.schemas';

const router = Router();

// User Signup
router.post(
  '/signup',
  writeRateLimiter,
  validate({ body: signupSchema }),
  asyncHandler(signup)
);

// User Login
router.post(
  '/login',
  writeRateLimiter,
  validate({ body: loginSchema }),
  asyncHandler(login)
);

export default router;
