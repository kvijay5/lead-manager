import request from 'supertest';
import { app } from '../../src/app';

export async function createTestUser(custom?: {
  name?: string;
  email?: string;
  password?: string;
}) {
  const payload = {
    name: custom?.name || 'Test User',
    email:
      custom?.email ||
      `user_${Date.now()}_${Math.random().toString(36).substring(7)}@test.com`,
    password: custom?.password || 'Password123',
  };

  const res = await request(app).post('/api/auth/signup').send(payload);

  return {
    user: res.body.user,
    token: res.body.token as string,
    credentials: payload,
  };
}
