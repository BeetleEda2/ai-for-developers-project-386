import crypto from 'node:crypto';
import type { Owner, EventType, Booking } from './types.js';

export const owner: Owner = {
  id: 'owner-1',
  name: 'Alex',
  timezone: 'Europe/Moscow',
};

export const eventTypes: EventType[] = [
  {
    id: crypto.randomUUID(),
    title: '30-min Consultation',
    description: 'Quick chat about your needs',
    durationMinutes: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Deep Dive Session',
    description: 'In-depth technical discussion',
    durationMinutes: 30,
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    title: 'Q&A Session',
    description: 'Ask me anything',
    durationMinutes: 30,
    createdAt: new Date().toISOString(),
  },
];

export const bookings: Booking[] = [];
