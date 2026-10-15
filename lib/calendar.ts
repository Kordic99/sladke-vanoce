import type { Plan, CalendarEvent, EventKind } from "./plan";

export type CalendarEntry = CalendarEvent & { recipeId: string; recipeName: string };
export const kindLabels: Record<EventKind, string> = { dough: "Chystání těsta", bake: "Pečení", decorate: "Zdobení", shopping: "Nákup surovin", other: "Jiná příprava" };
export function pragueToday(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en", { timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const part = (type: string) => parts.find(p => p.type === type)!.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
}
// UTC noon keeps date-only arithmetic independent of daylight saving changes.
export function addDays(date: string, days: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function calendarEntries(plan: Plan): CalendarEntry[] {
  return plan.recipes.flatMap(r => (r.events || []).map(e => ({ ...e, recipeId: r.id, recipeName: r.name })))
    .sort((a, b) => a.date.localeCompare(b.date) || (a.time || "00:00").localeCompare(b.time || "00:00") || a.recipeName.localeCompare(b.recipeName, "cs") || a.id.localeCompare(b.id));
}
export function upcomingEntries(plan: Plan, today: string): CalendarEntry[] {
  const end = addDays(today, 7);
  return calendarEntries(plan).filter(e => !e.done && e.date >= today && e.date <= end);
}
export function formatDate(date: string, options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" }): string {
  return new Intl.DateTimeFormat("cs-CZ", { ...options, timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
}
export function monthCells(month: string): string[] {
  const first = `${month.slice(0, 7)}-01`;
  const weekday = new Date(`${first}T12:00:00Z`).getUTCDay();
  const start = addDays(first, -((weekday + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}
export function shiftMonth(month: string, offset: number): string {
  const d = new Date(`${month.slice(0, 7)}-01T12:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() + offset);
  return d.toISOString().slice(0, 10);
}
export function reminderKey(e: CalendarEntry): string { return JSON.stringify([e.recipeId, e.id, e.date, e.time || ""]); }
