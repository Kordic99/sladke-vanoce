import test from "node:test";
import assert from "node:assert/strict";
import { defaultPlan, validatePlan, validateCleaningTasks } from "../lib/plan.ts";
import { cleaningStatus, sortCleaningTasks } from "../lib/cleaning.ts";
import { PlanSync, PlanConflict } from "../lib/plan-sync.ts";

const task = (id, values = {}) => ({ id, title: "Utřít prach", room: "Obývák", date: "2026-12-10", time: "14:30", notes: "I horní poličku", done: false, ...values });
const drafts = () => ({ read: () => null, write() {}, clear() {} });
test("old plans remain valid; cleaning tasks survive a JSON backup round trip", () => {
  const old = defaultPlan(); assert.ok(validatePlan(old));
  const plan = { ...old, cleaningTasks: [task("dust")] };
  assert.ok(validatePlan(JSON.parse(JSON.stringify(plan))));
  assert.deepEqual(JSON.parse(JSON.stringify(plan)).cleaningTasks, plan.cleaningTasks);
});
test("support undated tasks but reject a time without a date", () => {
  assert.ok(validateCleaningTasks([task("a", { date: "", time: "", room: "", notes: "" })]));
  assert.equal(validateCleaningTasks([task("a", { date: "" })]), false);
});
test("reject invalid dates, times, duplicate ids and invalid text fields", () => {
  for (const values of [{ date: "2026-02-30" }, { date: "tomorrow" }, { time: "24:00" }, { time: "9:30" }, { title: "  " }, { title: "x".repeat(121) }, { room: "x".repeat(61) }, { notes: "x".repeat(1501) }, { done: "true" }, { room: null }]) assert.equal(validateCleaningTasks([task("a", values)]), false, JSON.stringify(values));
  assert.equal(validateCleaningTasks([task("same"), task("same")]), false);
  assert.equal(validatePlan({ ...defaultPlan(), cleaningTasks: {} }), false);
});
test("allow up to 300 tasks", () => {
  const tasks = Array.from({ length: 300 }, (_, i) => task(String(i)));
  assert.ok(validateCleaningTasks(tasks)); assert.equal(validateCleaningTasks([...tasks, task("extra")]), false);
});
test("completed and undated tasks are never marked overdue", () => {
  assert.equal(cleaningStatus(task("a"), "2026-12-11"), "overdue");
  assert.equal(cleaningStatus(task("a"), "2026-12-10"), "today");
  assert.equal(cleaningStatus(task("a"), "2026-12-09"), "upcoming");
  assert.equal(cleaningStatus(task("a", { done: true }), "2026-12-11"), "done");
  assert.equal(cleaningStatus(task("a", { date: "", time: "" }), "2026-12-11"), "unscheduled");
});
test("sort pending tasks by date and time, then undated, then completed; keep source intact", () => {
  const tasks = [task("done", { done: true, date: "2026-01-01" }), task("no-date", { date: "", time: "" }), task("later", { date: "2026-12-20" }), task("afternoon"), task("morning", { time: "08:00" })];
  assert.deepEqual(sortCleaningTasks(tasks).map(t => t.id), ["morning", "afternoon", "later", "no-date", "done"]);
  assert.equal(tasks[0].id, "done");
});
test("two phones sync task creation, rescheduling, completion and deletion without changing recipes", async () => {
  let stored = { plan: defaultPlan(), revision: 0 };
  const remote = { load: async () => structuredClone(stored), save: async (plan, revision) => { if (revision !== stored.revision) throw new PlanConflict(); stored = { plan: structuredClone(plan), revision: revision + 1 }; return stored.revision; } };
  const a = new PlanSync(remote, await remote.load(), drafts());
  const b = new PlanSync(remote, await remote.load(), drafts());
  a.update({ ...a.state.plan, cleaningTasks: [task("dust")] }); await a.flush(); await b.refresh();
  assert.equal(b.state.plan.cleaningTasks[0].title, "Utřít prach");
  b.update({ ...b.state.plan, cleaningTasks: b.state.plan.cleaningTasks.map(t => ({ ...t, date: "2026-12-15", done: true })) }); await b.flush(); await a.refresh();
  assert.equal(a.state.plan.cleaningTasks[0].date, "2026-12-15"); assert.equal(a.state.plan.cleaningTasks[0].done, true);
  a.update({ ...a.state.plan, cleaningTasks: [] }); await a.flush(); await b.refresh();
  assert.deepEqual(b.state.plan.cleaningTasks, []); assert.deepEqual(stored.plan.recipes, defaultPlan().recipes);
});
