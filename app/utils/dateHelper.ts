// ── Helpers ───────────────────────────────────────────────
import {CalendarDate, type DateValue, getLocalTimeZone} from "@internationalized/date";

export function toISO(date: DateValue, time: string): string {
  const [h, m] = time.split(':').map(Number)
  const d = date.toDate(getLocalTimeZone())
  d.setHours(h ?? 0, m ?? 0, 0, 0)
  return d.toISOString()
}

export function dateToCalendar(d: Date): CalendarDate {
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export function dateToTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
