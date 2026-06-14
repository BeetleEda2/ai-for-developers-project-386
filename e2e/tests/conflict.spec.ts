import { test, expect } from './helpers.js';
import { randomUUID } from 'node:crypto';

test.describe('Conflict — booking an already taken slot', () => {
  test('API returns 409 TIME_SLOT_TAKEN for duplicate start time', async ({ request }) => {
    const uid = randomUUID().slice(0, 8);

    // Get an event type and an available slot
    const typesResp = await request.get('http://127.0.0.1:3000/event-types');
    const types = await typesResp.json();
    const et = types[0];

    const slotsResp = await request.get(`http://127.0.0.1:3000/event-types/${et.id}/slots`);
    const slots = await slotsResp.json();
    const free = slots.find((s: { available: boolean }) => s.available);
    test.skip(!free, 'No available slot');

    // First booking succeeds
    const r1 = await request.post('http://127.0.0.1:3000/bookings', {
      data: {
        eventTypeId: et.id,
        start: free.start,
        guestName: 'First Guest',
        guestEmail: `first-${uid}@test.com`,
      },
    });
    expect(r1.status()).toBe(201);

    // Second booking with same start → 409 regardless of eventTypeId
    const r2 = await request.post('http://127.0.0.1:3000/bookings', {
      data: {
        eventTypeId: et.id,
        start: free.start,
        guestName: 'Second Guest',
        guestEmail: `second-${uid}@test.com`,
      },
    });
    expect(r2.status()).toBe(409);

    const body = await r2.json();
    expect(body.code).toBe('TIME_SLOT_TAKEN');
    expect(body.message).toContain('already booked');
  });
});
