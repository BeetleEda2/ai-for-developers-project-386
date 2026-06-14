import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import type { Slot } from './types.js';
import { owner, bookings } from './store.js';

dayjs.extend(utc);
dayjs.extend(timezone);

const SLOT_MINUTES = 30;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;

export function generateSlots(from?: string, to?: string): Slot[] {
  const now = dayjs.utc();
  const windowStart = now;
  const windowEnd = now.add(14, 'day').endOf('day');

  const queryFrom = from ? dayjs.utc(from) : null;
  const queryTo = to ? dayjs.utc(to) : null;

  const effectiveFrom = queryFrom && queryFrom.isAfter(windowStart) ? queryFrom : windowStart;
  const effectiveTo = queryTo && queryTo.isBefore(windowEnd) ? queryTo : windowEnd;

  const tz = owner.timezone;
  const slots: Slot[] = [];

  let cursorDate = dayjs.utc(effectiveFrom).tz(tz).startOf('day');
  const limitDate = dayjs.utc(effectiveTo).tz(tz).endOf('day');

  while (cursorDate.isBefore(limitDate, 'day')) {
    const dayOfWeek = cursorDate.day();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      for (let slotMin = WORK_START_HOUR * 60; slotMin < WORK_END_HOUR * 60; slotMin += SLOT_MINUTES) {
        const hour = Math.floor(slotMin / 60);
        const minute = slotMin % 60;
        const dateStr = cursorDate.format('YYYY-MM-DD');
        const localDt = dayjs.tz(`${dateStr}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`, tz);
        const startUtc = localDt.utc();
        const endUtc = startUtc.add(SLOT_MINUTES, 'minute');

        if (startUtc.isBefore(now)) continue;
        if (startUtc.isAfter(effectiveTo)) continue;

        const isBooked = bookings.some((b) => b.start === startUtc.toISOString());

        slots.push({
          start: startUtc.toISOString(),
          end: endUtc.toISOString(),
          available: !isBooked,
        });
      }
    }
    cursorDate = cursorDate.add(1, 'day');
  }

  return slots;
}
