import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
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
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );

  // Parse JSON bodies with strict size limit (prevents payload exhaustion)
  app.use(express.json({ limit: '10kb' }));

  // Health check route
  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // Leads routes
  app.use('/api/leads', leadsRouter);

  // Handle 404 routes
  app.use(notFound);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();
