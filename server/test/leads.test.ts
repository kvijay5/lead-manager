import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { createTestUser } from './helpers/auth.helper';

describe('Leads API (/api/leads)', () => {
  describe('POST /api/leads', () => {
    it('should create a new lead with valid data and return 201 with default status NEW', async () => {
      const { token } = await createTestUser();

      const payload = {
        name: 'Johnathan Doe',
        email: 'johnathan@example.com',
        phone: '+1 555-0199',
        company: 'Stark Industries',
        source: 'WEBSITE',
      };

      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.data).toMatchObject({
        name: 'Johnathan Doe',
        email: 'johnathan@example.com',
        phone: '+1 555-0199',
        company: 'Stark Industries',
        source: 'WEBSITE',
        status: 'NEW',
      });
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('userId');
      expect(res.body.data).toHaveProperty('createdAt');
      expect(res.body.data).toHaveProperty('updatedAt');
    });

    it('should fail (400) when required fields are missing with field-level details', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toHaveProperty('details');
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'name' }),
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'phone' }),
          expect.objectContaining({ field: 'company' }),
          expect.objectContaining({ field: 'source' }),
        ])
      );
    });

    it('should fail (400) when email format is invalid', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Jane Doe',
          email: 'not-an-email',
          phone: '+1 555-0199',
          company: 'Acme',
          source: 'WEBSITE',
        });

      expect(res.status).toBe(400);
      expect(res.body.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'email' })])
      );
    });

    it('should fail (400) when phone contains fewer than 7 digits or invalid characters', async () => {
      const { token } = await createTestUser();

      const resFewDigits = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '123',
          company: 'Acme',
          source: 'WEBSITE',
        });

      expect(resFewDigits.status).toBe(400);
      expect(resFewDigits.body.error.details).toEqual(
        expect.arrayContaining([expect.objectContaining({ field: 'phone' })])
      );

      const resInvalidChars = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Jane Doe',
          email: 'jane@example.com',
          phone: '555-CALL-NOW',
          company: 'Acme',
          source: 'WEBSITE',
        });

      expect(resInvalidChars.status).toBe(400);
    });

    it('should fail (409) when creating duplicate email for the same user (case-insensitive)', async () => {
      const { token } = await createTestUser();

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'First Lead',
          email: 'lead@corp.com',
          phone: '+1 555-0100',
          company: 'Corp A',
          source: 'WEBSITE',
        });

      const resDuplicate = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Second Lead',
          email: 'LEAD@CORP.COM', // case insensitive
          phone: '+1 555-0200',
          company: 'Corp B',
          source: 'LINKEDIN',
        });

      expect(resDuplicate.status).toBe(409);
      expect(resDuplicate.body.error.message).toContain('already exists');
    });

    it('should fail (401) when unauthenticated', async () => {
      const res = await request(app).post('/api/leads').send({
        name: 'Unauth Lead',
        email: 'unauth@corp.com',
        phone: '+1 555-0100',
        company: 'Corp',
        source: 'WEBSITE',
      });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/leads (List, search, filter, paginate, sort)', () => {
    it('should return paginated leads with metadata', async () => {
      const { token } = await createTestUser();

      // Seed 3 leads
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post('/api/leads')
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: `Lead ${i}`,
            email: `lead${i}@paginate.test`,
            phone: `+1 555-000${i}`,
            company: `Company ${i}`,
            source: 'WEBSITE',
          });
      }

      const res = await request(app)
        .get('/api/leads?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.meta).toEqual({
        total: 3,
        page: 1,
        limit: 2,
        totalPages: 2,
      });
    });

    it('should search case-insensitively across name, email, and company', async () => {
      const { token } = await createTestUser();

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Bruce Wayne',
          email: 'bruce@wayne-enterprises.test',
          phone: '+1 555-1111',
          company: 'Wayne Enterprises',
          source: 'REFERRAL',
        });

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Clark Kent',
          email: 'clark@dailyplanet.test',
          phone: '+1 555-2222',
          company: 'Daily Planet Inc',
          source: 'WEBSITE',
        });

      // Search by name lowercase
      const resByName = await request(app)
        .get('/api/leads?search=wayne')
        .set('Authorization', `Bearer ${token}`);
      expect(resByName.body.data).toHaveLength(1);
      expect(resByName.body.data[0].name).toBe('Bruce Wayne');

      // Search by company
      const resByCompany = await request(app)
        .get('/api/leads?search=planet')
        .set('Authorization', `Bearer ${token}`);
      expect(resByCompany.body.data).toHaveLength(1);
      expect(resByCompany.body.data[0].name).toBe('Clark Kent');
    });

    it('should filter by status and support combined search + status', async () => {
      const { token } = await createTestUser();

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Alpha New',
          email: 'alpha@test.com',
          phone: '+1 555-1000',
          company: 'Alpha Inc',
          source: 'WEBSITE',
          status: 'NEW',
        });

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Alpha Qualified',
          email: 'alpha_q@test.com',
          phone: '+1 555-2000',
          company: 'Alpha Inc',
          source: 'WEBSITE',
          status: 'QUALIFIED',
        });

      const resFilter = await request(app)
        .get('/api/leads?status=QUALIFIED')
        .set('Authorization', `Bearer ${token}`);
      expect(resFilter.body.data).toHaveLength(1);
      expect(resFilter.body.data[0].name).toBe('Alpha Qualified');

      const resCombined = await request(app)
        .get('/api/leads?search=Alpha&status=NEW')
        .set('Authorization', `Bearer ${token}`);
      expect(resCombined.body.data).toHaveLength(1);
      expect(resCombined.body.data[0].name).toBe('Alpha New');
    });

    it('should sort correctly by name asc and desc', async () => {
      const { token } = await createTestUser();

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Zoe Zimmerman',
          email: 'zoe@test.com',
          phone: '+1 555-9000',
          company: 'Zeta Corp',
          source: 'WEBSITE',
        });

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Adam Archer',
          email: 'adam@test.com',
          phone: '+1 555-1000',
          company: 'Archer Ltd',
          source: 'WEBSITE',
        });

      const resAsc = await request(app)
        .get('/api/leads?sortBy=name&order=asc')
        .set('Authorization', `Bearer ${token}`);
      expect(resAsc.body.data[0].name).toBe('Adam Archer');

      const resDesc = await request(app)
        .get('/api/leads?sortBy=name&order=desc')
        .set('Authorization', `Bearer ${token}`);
      expect(resDesc.body.data[0].name).toBe('Zoe Zimmerman');
    });
  });

  describe('GET /api/leads/:id', () => {
    it('should return lead by ID (200)', async () => {
      const { token } = await createTestUser();

      const createRes = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Single Lead',
          email: 'single@test.com',
          phone: '+1 555-7777',
          company: 'Single Corp',
          source: 'EVENT',
        });

      const leadId = createRes.body.data.id;

      const res = await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(leadId);
      expect(res.body.data.name).toBe('Single Lead');
    });

    it('should return 400 for invalid UUID (not 500)', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get('/api/leads/not-a-valid-uuid')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('Validation failed');
    });

    it('should return 404 for non-existent UUID', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .get('/api/leads/11111111-2222-3333-4444-555555555555')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.message).toContain('not found');
    });
  });

  describe('PUT /api/leads/:id', () => {
    it('should partially update lead fields (200)', async () => {
      const { token } = await createTestUser();

      const createRes = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Original Lead',
          email: 'orig@test.com',
          phone: '+1 555-8888',
          company: 'Original Co',
          source: 'WEBSITE',
          status: 'NEW',
        });

      const leadId = createRes.body.data.id;

      const updateRes = await request(app)
        .put(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'QUALIFIED',
          company: 'Updated Co',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data).toMatchObject({
        id: leadId,
        name: 'Original Lead', // preserved
        email: 'orig@test.com', // preserved
        company: 'Updated Co', // updated
        status: 'QUALIFIED', // updated
      });
    });

    it('should return 404 when updating non-existent lead', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put('/api/leads/11111111-2222-3333-4444-555555555555')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Does Not Exist' });

      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid UUID on update', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .put('/api/leads/bad-uuid')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Bad UUID' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    it('should delete a lead and return 204, then 404 on subsequent get', async () => {
      const { token } = await createTestUser();

      const createRes = await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'To Delete',
          email: 'delete@test.com',
          phone: '+1 555-9999',
          company: 'Delete Co',
          source: 'OTHER',
        });

      const leadId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.status).toBe(204);

      // Verify lead is gone
      const getRes = await request(app)
        .get(`/api/leads/${leadId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });

    it('should return 404 when deleting non-existent lead', async () => {
      const { token } = await createTestUser();

      const res = await request(app)
        .delete('/api/leads/11111111-2222-3333-4444-555555555555')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/leads/stats', () => {
    it('should return accurate counts grouped by each status and total count', async () => {
      const { token } = await createTestUser();

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Lead 1',
          email: 'l1@test.com',
          phone: '+1 555-1001',
          company: 'Co 1',
          source: 'WEBSITE',
          status: 'NEW',
        });

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Lead 2',
          email: 'l2@test.com',
          phone: '+1 555-1002',
          company: 'Co 2',
          source: 'WEBSITE',
          status: 'CONTACTED',
        });

      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Lead 3',
          email: 'l3@test.com',
          phone: '+1 555-1003',
          company: 'Co 3',
          source: 'WEBSITE',
          status: 'QUALIFIED',
        });

      const res = await request(app)
        .get('/api/leads/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(3);
      expect(res.body.byStatus).toEqual({
        NEW: 1,
        CONTACTED: 1,
        QUALIFIED: 1,
        LOST: 0,
      });
    });
  });
});
