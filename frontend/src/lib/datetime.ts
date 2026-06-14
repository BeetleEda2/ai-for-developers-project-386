import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

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
  slots: Array<{ start: string; end: string; available: boolean }>
): GroupedSlots[] {
  const available = slots.filter((s) => s.available);
  const map = new Map<string, GroupedSlots>();

  for (const slot of available) {
    const date = dayjs.utc(slot.start).format('YYYY-MM-DD');
    if (!map.has(date)) {
      map.set(date, {
        date,
        label: dayjs.utc(slot.start).format('dddd, MMM D'),
        slots: [],
      });
    }
    const group = map.get(date)!;
    group.slots.push({
      start: slot.start,
      end: slot.end,
      label: `${dayjs.utc(slot.start).format('HH:mm')} - ${dayjs.utc(slot.end).format('HH:mm')}`,
    });
  }
  return Array.from(map.values());
}

export function formatDateTime(iso: string): string {
  return dayjs.utc(iso).format('MMM D, YYYY HH:mm');
}

export function formatDate(iso: string): string {
  return dayjs.utc(iso).format('MMM D, YYYY');
}
