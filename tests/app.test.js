import assert from 'node:assert/strict';
import { after, describe, it } from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db/knex.js';

// These tests don't need a database: they cover the HTTP layer
// (routing, validation, auth guard and error formatting).
const app = createApp();

after(() => db.destroy());

describe('HTTP layer', () => {
  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health').expect(200);
    assert.equal(res.body.status, 'ok');
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const res = await request(app).get('/api/v1/does-not-exist').expect(404);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  it('protects admin routes', async () => {
    const res = await request(app).get('/api/v1/admin/posts').expect(401);
    assert.equal(res.body.error.code, 'UNAUTHORIZED');
  });

  it('rejects invalid tokens', async () => {
    await request(app).get('/api/v1/admin/posts').set('Authorization', 'Bearer nope').expect(401);
  });

  it('validates the login body', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email' })
      .expect(422);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
    assert.ok(res.body.error.details.some((d) => d.field === 'email'));
  });

  it('handles malformed JSON', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .set('Content-Type', 'application/json')
      .send('{bad json')
      .expect(400);
    assert.equal(res.body.error.message, 'Malformed JSON body');
  });

  it('sets security headers', async () => {
    const res = await request(app).get('/health');
    assert.equal(res.headers['x-content-type-options'], 'nosniff');
    assert.equal(res.headers['x-powered-by'], undefined);
  });
});
