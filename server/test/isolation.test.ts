import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app';
import { createTestUser } from './helpers/auth.helper';

describe('Data Isolation & Multi-Tenancy Security', () => {
  it('User B cannot see User A leads in list queries', async () => {
    const userA = await createTestUser({ email: 'userA@test.com' });
    const userB = await createTestUser({ email: 'userB@test.com' });

    // User A creates 2 leads
    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'User A Secret Client',
        email: 'clientA@secret.test',
        phone: '+1 555-0001',
        company: 'Confidential A Corp',
        source: 'WEBSITE',
      });

    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'User A Deal',
        email: 'dealA@secret.test',
        phone: '+1 555-0002',
        company: 'Confidential B Corp',
        source: 'REFERRAL',
      });

    // User B lists leads -> must be empty
    const resB = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${userB.token}`);

    expect(resB.status).toBe(200);
    expect(resB.body.data).toHaveLength(0);
    expect(resB.body.meta.total).toBe(0);

    // User A lists leads -> must see both
    const resA = await request(app)
      .get('/api/leads')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(resA.status).toBe(200);
    expect(resA.body.data).toHaveLength(2);
    expect(resA.body.meta.total).toBe(2);
  });

  it('User B cannot read User A lead by ID (returns 404, preventing existence leakage)', async () => {
    const userA = await createTestUser({ email: 'userA@test.com' });
    const userB = await createTestUser({ email: 'userB@test.com' });

    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'Alice Top Secret',
        email: 'alice@topsecret.test',
        phone: '+1 555-1234',
        company: 'Secret Org',
        source: 'COLD_CALL',
      });

    const leadId = createRes.body.data.id;

    // User B attempts to access User A's lead
    const resCross = await request(app)
      .get(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(resCross.status).toBe(404);
    expect(resCross.body.error.message).toContain('not found');

    // User A can access it without issue
    const resOwner = await request(app)
      .get(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(resOwner.status).toBe(200);
    expect(resOwner.body.data.id).toBe(leadId);
  });

  it('User B cannot update User A lead (returns 404 and does not mutate record)', async () => {
    const userA = await createTestUser({ email: 'userA@test.com' });
    const userB = await createTestUser({ email: 'userB@test.com' });

    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'Untouchable Lead',
        email: 'untouchable@test.com',
        phone: '+1 555-5555',
        company: 'Secure Inc',
        source: 'WEBSITE',
        status: 'NEW',
      });

    const leadId = createRes.body.data.id;

    // User B tries to update User A's lead
    const resCrossUpdate = await request(app)
      .put(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        name: 'Hacked by User B',
        status: 'LOST',
      });

    expect(resCrossUpdate.status).toBe(404);

    // Verify User A lead was NOT modified
    const resOwnerCheck = await request(app)
      .get(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(resOwnerCheck.status).toBe(200);
    expect(resOwnerCheck.body.data.name).toBe('Untouchable Lead');
    expect(resOwnerCheck.body.data.status).toBe('NEW');
  });

  it('User B cannot delete User A lead (returns 404 and does not delete record)', async () => {
    const userA = await createTestUser({ email: 'userA@test.com' });
    const userB = await createTestUser({ email: 'userB@test.com' });

    const createRes = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'Preserved Lead',
        email: 'preserved@test.com',
        phone: '+1 555-4444',
        company: 'Safe Co',
        source: 'EVENT',
      });

    const leadId = createRes.body.data.id;

    // User B attempts to delete User A's lead
    const resCrossDelete = await request(app)
      .delete(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(resCrossDelete.status).toBe(404);

    // Verify User A lead is still present
    const resOwnerCheck = await request(app)
      .get(`/api/leads/${leadId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(resOwnerCheck.status).toBe(200);
    expect(resOwnerCheck.body.data.id).toBe(leadId);
  });

  it('Lead statistics strictly isolate counts between users', async () => {
    const userA = await createTestUser({ email: 'userA@test.com' });
    const userB = await createTestUser({ email: 'userB@test.com' });

    // User A creates 3 leads (2 Qualified, 1 Contacted)
    for (const status of ['QUALIFIED', 'QUALIFIED', 'CONTACTED'] as const) {
      await request(app)
        .post('/api/leads')
        .set('Authorization', `Bearer ${userA.token}`)
        .send({
          name: `Lead ${status}`,
          email: `a_${Math.random()}@test.com`,
          phone: '+1 555-0000',
          company: 'A Corp',
          source: 'WEBSITE',
          status,
        });
    }

    // User B creates 1 lead (1 New)
    await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        name: 'User B Lead',
        email: 'b_unique@test.com',
        phone: '+1 555-9999',
        company: 'B Corp',
        source: 'WEBSITE',
        status: 'NEW',
      });

    // User A stats
    const statsA = await request(app)
      .get('/api/leads/stats')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(statsA.body.total).toBe(3);
    expect(statsA.body.byStatus).toEqual({
      NEW: 0,
      CONTACTED: 1,
      QUALIFIED: 2,
      LOST: 0,
    });

    // User B stats
    const statsB = await request(app)
      .get('/api/leads/stats')
      .set('Authorization', `Bearer ${userB.token}`);

    expect(statsB.body.total).toBe(1);
    expect(statsB.body.byStatus).toEqual({
      NEW: 1,
      CONTACTED: 0,
      QUALIFIED: 0,
      LOST: 0,
    });
  });

  it('Lead email uniqueness is scoped per user (two users can have the same lead email)', async () => {
    const userA = await createTestUser({ email: 'userA@test.com' });
    const userB = await createTestUser({ email: 'userB@test.com' });

    const sharedLeadEmail = 'shared-prospect@client.com';

    // User A creates lead with sharedLeadEmail
    const resA = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'Prospect for A',
        email: sharedLeadEmail,
        phone: '+1 555-1111',
        company: 'Client Corp',
        source: 'WEBSITE',
      });
    expect(resA.status).toBe(201);

    // User B can ALSO create lead with the same email
    const resB = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        name: 'Prospect for B',
        email: sharedLeadEmail,
        phone: '+1 555-2222',
        company: 'Client Corp',
        source: 'REFERRAL',
      });
    expect(resB.status).toBe(201);

    // But User A CANNOT create a duplicate of their own lead email
    const resADuplicate = await request(app)
      .post('/api/leads')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'Duplicate Prospect for A',
        email: sharedLeadEmail,
        phone: '+1 555-3333',
        company: 'Client Corp',
        source: 'LINKEDIN',
      });
    expect(resADuplicate.status).toBe(409);
  });
});
