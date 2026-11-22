import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import authRouter from './routes/auth.routes';
import leadsRouter from './routes/leads.routes';

export const createApp = () => {
  const app = express();

  // Security HTTP headers
  app.use(helmet());

  // Request logger (development only)
  if (env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  // Configure CORS
  const allowedOrigins = env.CLIENT_ORIGIN.split(',').map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          allowedOrigins.includes(origin) ||
          allowedOrigins.includes('*')
        ) {
          return callback(null, true);
        }
        return callback(null, false);
      },
      credentials: true,
    })
  );

  // Parse JSON bodies with strict size limit (prevents payload exhaustion)
  app.use(express.json({ limit: '10kb' }));

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Auth routes
  app.use('/api/auth', authRouter);

  // Leads routes
  app.use('/api/leads', leadsRouter);

  // Handle 404 routes
  app.use(notFound);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
