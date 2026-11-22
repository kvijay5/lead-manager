import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';
import leadsRouter from './routes/leads.routes';

export const createApp = () => {
  const app = express();

  // Configure CORS
  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
      credentials: true,
    })
  );

  // Parse JSON bodies
  app.use(express.json());

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
