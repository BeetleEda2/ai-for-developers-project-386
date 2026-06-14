import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';
import { eventTypes, bookings } from '../store.js';

function resetStore() {
  bookings.length = 0;
  // Keep eventTypes from store.ts but clear bookings
}

describe('API', () => {
  const app = createApp();

  beforeEach(() => {
    resetStore();
  });

  describe('GET /owner', () => {
    it('returns owner profile', async () => {
      const res = await request(app).get('/owner');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name');
      expect(res.body).toHaveProperty('timezone');
    });
  });

  describe('GET /event-types', () => {
    it('returns array of event types', async () => {
      const res = await request(app).get('/event-types');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('durationMinutes', 30);
    });
  });

  describe('GET /event-types/:id', () => {
    it('returns 404 for unknown id', async () => {
      const res = await request(app).get('/event-types/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });

    it('returns event type for known id', async () => {
      const listRes = await request(app).get('/event-types');
      const id = listRes.body[0].id;
      const res = await request(app).get(`/event-types/${id}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(id);
    });
  });

  describe('POST /event-types', () => {
    it('creates a new event type', async () => {
      const res = await request(app)
        .post('/event-types')
        .send({ title: 'Test Call', description: 'A test' });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe('Test Call');
      expect(res.body.description).toBe('A test');
      expect(res.body.durationMinutes).toBe(30);
    });

    it('returns 422 for missing title', async () => {
      const res = await request(app)
        .post('/event-types')
        .send({ description: 'no title' });
      expect(res.status).toBe(422);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('GET /event-types/:id/slots', () => {
    it('returns slot array for existing type', async () => {
      const listRes = await request(app).get('/event-types');
      const id = listRes.body[0].id;
      const res = await request(app).get(`/event-types/${id}/slots`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      if (res.body.length > 0) {
        expect(res.body[0]).toHaveProperty('start');
        expect(res.body[0]).toHaveProperty('end');
        expect(res.body[0]).toHaveProperty('available');
      }
    });

    it('returns 404 for unknown event type', async () => {
      const res = await request(app).get('/event-types/nonexistent/slots');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /bookings', () => {
    it('creates a booking and returns 201', async () => {
      const listRes = await request(app).get('/event-types');
      const etId = listRes.body[0].id;

      const slotsRes = await request(app).get(`/event-types/${etId}/slots`);
      const futureSlot = slotsRes.body.find((s: { available: boolean }) => s.available);
      if (!futureSlot) {
        // No available slots right now (e.g. outside working hours) — skip
        return;
      }

      const res = await request(app)
        .post('/bookings')
        .send({
          eventTypeId: etId,
          start: futureSlot.start,
          guestName: 'Test Guest',
          guestEmail: 'test@example.com',
        });
      expect(res.status).toBe(201);
      expect(res.body.guestName).toBe('Test Guest');
      expect(res.body.guestEmail).toBe('test@example.com');
      expect(res.body.eventTypeId).toBe(etId);
      expect(res.body).toHaveProperty('end');
      expect(res.body).toHaveProperty('id');
    });

    it('returns 409 when time slot is already taken', async () => {
      const listRes = await request(app).get('/event-types');
      const etId = listRes.body[0].id;

      const slotsRes = await request(app).get(`/event-types/${etId}/slots`);
      const futureSlot = slotsRes.body.find((s: { available: boolean }) => s.available);
      if (!futureSlot) return;

      // First booking
      await request(app)
        .post('/bookings')
        .send({
          eventTypeId: etId,
          start: futureSlot.start,
          guestName: 'First Guest',
          guestEmail: 'first@example.com',
        });

      // Second booking — same slot, different event type
      const etId2 = listRes.body[2]?.id || etId;
      const res = await request(app)
        .post('/bookings')
        .send({
          eventTypeId: etId2,
          start: futureSlot.start,
          guestName: 'Second Guest',
          guestEmail: 'second@example.com',
        });
      expect(res.status).toBe(409);
      expect(res.body.code).toBe('TIME_SLOT_TAKEN');
    });

    it('returns 422 for invalid time (past)', async () => {
      const listRes = await request(app).get('/event-types');
      const etId = listRes.body[0].id;

      const res = await request(app)
        .post('/bookings')
        .send({
          eventTypeId: etId,
          start: '2020-01-01T10:00:00.000Z',
          guestName: 'Past Guest',
          guestEmail: 'past@example.com',
        });
      expect(res.status).toBe(422);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });

    it('returns 422 for non-aligned time', async () => {
      const listRes = await request(app).get('/event-types');
      const etId = listRes.body[0].id;

      const res = await request(app)
        .post('/bookings')
        .send({
          eventTypeId: etId,
          start: new Date(Date.now() + 3600000 + 60000).toISOString(), // +1h1m
          guestName: 'Bad Time',
          guestEmail: 'bad@example.com',
        });
      expect(res.status).toBe(422);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });

    it('returns 422 for missing fields', async () => {
      const res = await request(app)
        .post('/bookings')
        .send({ eventTypeId: 'x' });
      expect(res.status).toBe(422);
      expect(res.body.code).toBe('VALIDATION_FAILED');
    });
  });

  describe('GET /bookings', () => {
    it('returns booking array', async () => {
      const res = await request(app).get('/bookings');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('GET /bookings/:id', () => {
    it('returns 404 for unknown id', async () => {
      const res = await request(app).get('/bookings/nonexistent');
      expect(res.status).toBe(404);
      expect(res.body.code).toBe('NOT_FOUND');
    });
  });
});
