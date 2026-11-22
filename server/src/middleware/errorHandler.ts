import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError';
import { env } from '../config/env';

export interface StandardErrorResponse {
  error: {
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response<StandardErrorResponse>,
  _next: NextFunction
): void => {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.join('.') || 'root',
      message: issue.message,
    }));

    res.status(400).json({
      error: {
        message: 'Validation failed',
        details,
      },
    });
    return;
  }

  // Handle custom application errors
  if (err instanceof AppError) {
    const response: StandardErrorResponse = {
      error: {
        message: err.message,
        ...(err.details && err.details.length > 0
          ? { details: err.details }
          : {}),
      },
    };

    res.status(err.statusCode).json(response);
    return;
  }

  // Handle Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? (err.meta?.target as string[]).join(', ')
        : 'field';

      res.status(409).json({
        error: {
          message: `A record with this ${target} already exists`,
          details: [
            {
              field: target,
              message: 'Duplicate value violates unique constraint',
            },
          ],
        },
      });
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json({
        error: {
          message: 'Requested record not found',
        },
      });
      return;
    }

    if (err.code === 'P2003') {
      res.status(400).json({
        error: {
          message: 'Foreign key constraint failed',
        },
      });
      return;
    }
  }

  // Handle malformed JSON body
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json({
      error: {
        message: 'Invalid JSON payload in request body',
      },
    });
    return;
  }

  // Fallback for unhandled or internal server errors
  if (env.NODE_ENV !== 'test') {
    console.error('Unhandled server error:', err);
  }

  res.status(500).json({
    error: {
      message: 'Internal server error',
    },
  });
};
