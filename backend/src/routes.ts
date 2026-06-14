import crypto from 'node:crypto';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { Router } from 'express';
import { owner, eventTypes, bookings } from './store.js';
import { generateSlots } from './slots.js';
import { validateBookingCreate, validateBookingStart } from './validation.js';
import type { Booking, EventType } from './types.js';

dayjs.extend(utc);

const router = Router();

router.get('/owner', (_req, res) => {
  res.json(owner);
});

router.get('/event-types', (_req, res) => {
  res.json(eventTypes);
});

router.get('/event-types/:id', (req, res) => {
  const et = eventTypes.find((e) => e.id === req.params.id);
  if (!et) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Event type not found' });
  }
  res.json(et);
});

router.post('/event-types', (req, res) => {
  const { title, description } = req.body || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(422).json({ code: 'VALIDATION_FAILED', message: 'Title is required' });
  }
  const et: EventType = {
    id: crypto.randomUUID(),
    title: title.trim(),
    description: description?.trim() || null,
    durationMinutes: 30,
    createdAt: new Date().toISOString(),
  };
  eventTypes.push(et);
  res.status(201).json(et);
});

router.get('/event-types/:id/slots', (req, res) => {
  const et = eventTypes.find((e) => e.id === req.params.id);
  if (!et) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Event type not found' });
  }
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  const slots = generateSlots(from, to);
  res.json(slots);
});

router.get('/bookings', (_req, res) => {
  res.json(bookings);
});

router.get('/bookings/:id', (req, res) => {
  const b = bookings.find((bk) => bk.id === req.params.id);
  if (!b) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Booking not found' });
  }
  res.json(b);
});

router.post('/bookings', (req, res) => {
  const validation = validateBookingCreate(req.body);
  if (!validation.valid) {
    return res.status(422).json({ code: validation.code, message: validation.message });
  }

  const { eventTypeId, start, guestName, guestEmail, notes } = req.body;

  const et = eventTypes.find((e) => e.id === eventTypeId);
  if (!et) {
    return res.status(404).json({ code: 'NOT_FOUND', message: 'Event type not found' });
  }

  const slotTaken = bookings.some((b) => b.start === start);
  if (slotTaken) {
    return res.status(409).json({ code: 'TIME_SLOT_TAKEN', message: 'This time slot is already booked' });
  }

  const startDate = dayjs.utc(start);
  const endDate = startDate.add(30, 'minute');

  const booking: Booking = {
    id: crypto.randomUUID(),
    eventTypeId,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    guestName,
    guestEmail,
    notes: notes || null,
    createdAt: new Date().toISOString(),
  };

  bookings.push(booking);
  res.status(201).json(booking);
});

export default router;
