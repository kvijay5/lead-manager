import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const writeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 write operations per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => env.NODE_ENV === 'test',
  handler: (_req, res) => {
    res.status(429).json({
      error: {
        message: 'Too many requests from this IP, please try again later.',
      },
    });
  },
});
