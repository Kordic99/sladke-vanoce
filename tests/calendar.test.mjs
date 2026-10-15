import test from "node:test";
import assert from "node:assert/strict";
import { defaultPlan, isISODate, validateEvents, validatePlan } from "../lib/plan.ts";
import { pragueToday, addDays, calendarEntries, upcomingEntries, monthCells, shiftMonth, reminderKey } from "../lib/calendar.ts";

const event = (id, date, extra = {}) => ({ id, title: "Pečení", date, kind: "bake", done: false, ...extra });
test("upcoming window includes today and exactly one week ahead; skips done and past events", () => {
  const p = defaultPlan();
  p.recipes[0].events = [event("past", "2026-12-09"), event("today", "2026-12-10"), event("week", "2026-12-17"), event("later", "2026-12-18"), event("done", "2026-12-12", { done: true })];
  assert.deepEqual(upcomingEntries(p, "2026-12-10").map(e => e.id), ["today", "week"]);
});
test("calendar also includes recipes outside shopping plan, sorted by date and time", () => {
  const p = defaultPlan(); p.recipes[0].active = false;
  p.recipes[0].events = [event("late", "2026-12-15", { time: "18:00" }), event("early", "2026-12-15", { time: "09:00" })];
  p.recipes[1].events = [event("previous", "2026-12-14")];
  const entries = calendarEntries(p);
  assert.deepEqual(entries.map(e => e.id), ["previous", "early", "late"]);
  assert.equal(entries[1].recipeId, p.recipes[0].id);
  assert.equal(entries[1].recipeName, "Vanilkové rohlíčky");
});
test("Prague day follows local midnight in summer and winter", () => {
  assert.equal(pragueToday(new Date("2026-12-10T22:59:00Z")), "2026-12-10");
  assert.equal(pragueToday(new Date("2026-12-10T23:00:00Z")), "2026-12-11");
  assert.equal(pragueToday(new Date("2026-07-10T22:00:00Z")), "2026-07-11");
  assert.equal(addDays("2026-10-24", 7), "2026-10-31");
  assert.equal(addDays("2026-12-29", 7), "2027-01-05");
});
test("month grid starts Monday and handles year and leap-day boundaries", () => {
  const cells = monthCells("2026-12-01");
  assert.equal(cells.length, 42); assert.equal(cells[0], "2026-11-30"); assert.equal(cells[41], "2027-01-10");
  assert.equal(shiftMonth("2026-12-18", 1), "2027-01-01");
  assert.ok(monthCells("2028-02-01").includes("2028-02-29"));
});
test("legacy backups remain valid and new calendar events survive export/import", () => {
  const p = defaultPlan(); assert.ok(validatePlan(p));
  p.recipes[0].events = [event("dough", "2026-12-14", { title: "Těsto na rohlíčky", kind: "dough", time: "17:30" }), event("bake", "2026-12-15")];
  const restored = JSON.parse(JSON.stringify(p));
  assert.ok(validatePlan(restored)); assert.deepEqual(restored.recipes[0].events, p.recipes[0].events);
});
test("reject impossible dates, invalid times, empty titles, unknown kinds and duplicate ids", () => {
  assert.equal(isISODate("2026-02-29"), false); assert.equal(isISODate("2028-02-29"), true);
  for (const date of ["2026-11-31", "2026-13-01", "2026-00-01", "2026-2-01", "not-a-date"]) assert.equal(validateEvents([event("a", date)]), false);
  for (const values of [{ time: "24:00" }, { time: "12:60" }, { time: 1200 }, { title: " " }, { kind: "unknown" }, { done: "yes" }]) assert.equal(validateEvents([event("a", "2026-12-15", values)]), false);
  assert.equal(validateEvents([event("a", "2026-12-15"), event("a", "2026-12-16")]), false);
  const p = defaultPlan(); p.recipes[0].events = [event("a", "2026-02-30")]; assert.equal(validatePlan(p), false);
});
test("rescheduling creates a fresh reminder occurrence, completion does not change its identity", () => {
  const p = defaultPlan(); p.recipes[0].events = [event("a", "2026-12-15", { time: "10:00" })];
  const first = calendarEntries(p)[0];
  assert.notEqual(reminderKey(first), reminderKey({ ...first, date: "2026-12-16" }));
  assert.notEqual(reminderKey(first), reminderKey({ ...first, time: "11:00" }));
  assert.equal(reminderKey(first), reminderKey({ ...first, done: true }));
});
