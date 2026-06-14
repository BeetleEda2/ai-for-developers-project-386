import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface GroupedSlots {
  date: string;
  label: string;
  slots: Array<{
    start: string;
    end: string;
    label: string;
  }>;
}

export function groupSlotsByDay(
  slots: Array<{ start: string; end: string; available: boolean }>,
  tz = 'UTC'
): GroupedSlots[] {
  const available = slots.filter((s) => s.available);
  const map = new Map<string, GroupedSlots>();

  for (const slot of available) {
    const date = dayjs.utc(slot.start).tz(tz).format('YYYY-MM-DD');
    if (!map.has(date)) {
      map.set(date, {
        date,
        label: dayjs.utc(slot.start).tz(tz).format('dddd, MMM D'),
        slots: [],
      });
    }
    const group = map.get(date)!;
    group.slots.push({
      start: slot.start,
      end: slot.end,
      label: `${dayjs.utc(slot.start).tz(tz).format('HH:mm')} - ${dayjs.utc(slot.end).tz(tz).format('HH:mm')}`,
    });
  }
  return Array.from(map.values());
}

export function formatDateTime(iso: string, tz = 'UTC'): string {
  return dayjs.utc(iso).tz(tz).format('MMM D, YYYY HH:mm');
}

export function formatDate(iso: string, tz = 'UTC'): string {
  return dayjs.utc(iso).tz(tz).format('MMM D, YYYY');
}
