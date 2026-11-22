import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

interface JwtPayload {
  userId: string;
}

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    if (!payload || !payload.userId) {
      throw new AppError('Invalid authentication token', 401);
    }

    req.user = { id: payload.userId };
    next();
  } catch (err: unknown) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError('Invalid or expired token', 401);
  }
};
