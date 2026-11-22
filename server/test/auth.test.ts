import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { createTestUser } from './helpers/auth.helper';

describe('Authentication API (/api/auth)', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user and return user profile with JWT token (201)', async () => {
      const payload = {
        name: 'Sarah Connor',
        email: 'sarah@skynet.test',
        password: 'Password123',
      };

      const res = await request(app).post('/api/auth/signup').send(payload);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
      expect(res.body.user).toMatchObject({
        name: 'Sarah Connor',
        email: 'sarah@skynet.test',
      });
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user).toHaveProperty('createdAt');
      expect(res.body.user).not.toHaveProperty('password');
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should fail (409) if email is already registered', async () => {
      await createTestUser({ email: 'duplicate@test.com' });

      const res = await request(app).post('/api/auth/signup').send({
        name: 'Another User',
        email: 'duplicate@test.com',
        password: 'Password123',
      });

      expect(res.status).toBe(409);
      expect(res.body.error).toHaveProperty('message');
      expect(res.body.error.message).toContain('already exists');
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })])
      );
    });

    it('should fail (400) when password is too short (< 8 chars)', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Short Pass',
        email: 'short@test.com',
        password: 'Pass1',
      });

      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('at least 8 characters'),
          }),
        ])
      );
    });

    it('should fail (400) when password lacks digits or letters', async () => {
      const resOnlyLetters = await request(app).post('/api/auth/signup').send({
        name: 'No Digits',
        email: 'nodigits@test.com',
        password: 'PasswordOnly',
      });

      expect(resOnlyLetters.status).toBe(400);
      expect(resOnlyLetters.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('at least one number'),
          }),
        ])
      );

      const resOnlyDigits = await request(app).post('/api/auth/signup').send({
        name: 'No Letters',
        email: 'noletters@test.com',
        password: '1234567890',
      });

      expect(resOnlyDigits.status).toBe(400);
      expect(resOnlyDigits.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'password',
            message: expect.stringContaining('at least one letter'),
          }),
        ])
      );
    });

    it('should fail (400) when required fields are missing', async () => {
      const res = await request(app).post('/api/auth/signup').send({});

      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'password' }),
        ])
      );
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate valid credentials and return user profile with JWT (200)', async () => {
      const { credentials } = await createTestUser({
        email: 'login-test@test.com',
        password: 'Password123',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: credentials.email,
        password: credentials.password,
      });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toMatchObject({
        email: 'login-test@test.com',
      });
      expect(res.body.user).not.toHaveProperty('passwordHash');
    });

    it('should fail (401) on wrong password with generic message', async () => {
      const { credentials } = await createTestUser({
        email: 'wrong-pass@test.com',
        password: 'Password123',
      });

      const res = await request(app).post('/api/auth/login').send({
        email: credentials.email,
        password: 'WrongPassword999',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password');
    });

    it('should fail (401) for nonexistent user with generic message', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@test.com',
        password: 'Password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.error.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user profile (200) with valid Bearer token', async () => {
      const { token, user } = await createTestUser({
        name: 'Profile User',
        email: 'profile@test.com',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        id: user.id,
        name: 'Profile User',
        email: 'profile@test.com',
      });
    });

    it('should fail (401) when Authorization header is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain('Authentication required');
    });

    it('should fail (401) when Authorization token is invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer completely-invalid-jwt-token');

      expect(res.status).toBe(401);
      expect(res.body.error.message).toContain('Invalid or expired token');
    });
  });
});
