// ── Helpers ───────────────────────────────────────────────
import {CalendarDate, type DateValue, getLocalTimeZone} from "@internationalized/date";

export function toISO(date: DateValue, time: string): string {
  const [h, m] = time.split(':').map(Number)
  const d = date.toDate(getLocalTimeZone())
  d.setHours(h ?? 0, m ?? 0, 0, 0)
  return d.toISOString()
}

export function dateToCalendar(date: Date | string): CalendarDate {
  const d = new Date(date)
  return new CalendarDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export function dateToTime(date: Date | string): string {
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
