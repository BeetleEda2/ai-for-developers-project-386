import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter.js';
import type { BookingCreate } from './types.js';
import { owner } from './store.js';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

const SLOT_MINUTES = 30;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;

export interface ValidationResult {
  valid: boolean;
  code?: string;
  message?: string;
}

export function validateBookingCreate(body: unknown): ValidationResult {
  if (!body || typeof body !== 'object') {
    return { valid: false, code: 'VALIDATION_FAILED', message: 'Request body is required' };
  }

  const data = body as Record<string, unknown>;

  if (!data.eventTypeId || typeof data.eventTypeId !== 'string') {
    return { valid: false, code: 'VALIDATION_FAILED', message: 'eventTypeId is required' };
  }
  if (!data.start || typeof data.start !== 'string') {
    return { valid: false, code: 'VALIDATION_FAILED', message: 'start is required' };
  }
  if (!data.guestName || typeof data.guestName !== 'string' || !data.guestName.trim()) {
    return { valid: false, code: 'VALIDATION_FAILED', message: 'guestName is required' };
  }
  if (!data.guestEmail || typeof data.guestEmail !== 'string' || !data.guestEmail.trim()) {
    return { valid: false, code: 'VALIDATION_FAILED', message: 'guestEmail is required' };
  }

  return validateBookingStart(data.start);
}

export function validateBookingStart(start: string): ValidationResult {
  const startDate = dayjs.utc(start);

  if (!startDate.isValid()) {
    return { valid: false, code: 'VALIDATION_FAILED', message: 'Invalid start date format' };
  }

  const minutes = startDate.minute();
  const seconds = startDate.second();
  if ((minutes !== 0 && minutes !== 30) || seconds !== 0) {
    return { valid: false, code: 'VALIDATION_FAILED', message: 'Start time must be aligned to 30-minute grid (minutes 00 or 30, seconds 0)' };
  }

  const now = dayjs.utc();
  if (startDate.isBefore(now)) {
    return { valid: false, code: 'VALIDATION_FAILED', message: 'Start time cannot be in the past' };
  }

  const windowEnd = now.add(14, 'day');
  if (startDate.isAfter(windowEnd)) {
    return { valid: false, code: 'VALIDATION_FAILED', message: 'Start time must be within the next 14 days' };
  }

  const tz = owner.timezone;
  const localStart = startDate.tz(tz);
  const hour = localStart.hour();

  if (hour < WORK_START_HOUR || hour >= WORK_END_HOUR) {
    return { valid: false, code: 'VALIDATION_FAILED', message: `Start time must be within working hours (${WORK_START_HOUR}:00–${WORK_END_HOUR}:00) in ${tz} timezone` };
  }

  return { valid: true };
}
