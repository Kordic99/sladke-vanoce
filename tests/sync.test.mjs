import test from "node:test";
import assert from "node:assert/strict";
import { PlanSync, PlanConflict } from "../lib/plan-sync.ts";
import { defaultPlan } from "../lib/plan.ts";

const clone = structuredClone;
function memory(initial = null) {
  let draft = clone(initial);
  return { read: () => clone(draft), write: value => { draft = clone(value); }, clear: () => { draft = null; } };
}
function server() {
  let snapshot = { plan: defaultPlan(), revision: 0 };
  return { load: async () => clone(snapshot), save: async (plan, revision) => { if (revision !== snapshot.revision) throw new PlanConflict(); snapshot = { plan: clone(plan), revision: revision + 1 }; return snapshot.revision; } };
}
const changed = (sync, name) => ({ ...sync.state.plan, recipes: sync.state.plan.recipes.map((r, i) => i ? r : { ...r, name }) });

test("two phones receive saved recipes, shopping and calendar changes", async () => {
  const remote = server();
  const a = new PlanSync(remote, await remote.load(), memory());
  const b = new PlanSync(remote, await remote.load(), memory());
  const plan = changed(a, "Rodinné rohlíčky");
  plan.recipes[0].ingredients = [{ id: "butter", name: "Máslo", amount: 250, unit: "g" }];
  plan.recipes[0].events = [{ id: "bake", title: "Pečení", kind: "bake", date: "2026-12-20", done: false }];
  plan.bought['["máslo","g"]'] = 250;
  a.update(plan); await a.flush(); await b.refresh();
  assert.deepEqual(b.state.plan, plan); assert.equal(b.state.revision, 1); assert.equal(b.state.status, "saved");
});
test("simultaneous edits cannot overwrite a phone's newer cloud data", async () => {
  const remote = server(), draft = memory();
  const a = new PlanSync(remote, await remote.load(), memory());
  const b = new PlanSync(remote, await remote.load(), draft);
  a.update(changed(a, "Telefon A")); b.update(changed(b, "Telefon B"));
  await a.flush(); await b.flush();
  assert.equal((await remote.load()).plan.recipes[0].name, "Telefon A");
  assert.equal(b.state.status, "conflict"); assert.equal(b.state.plan.recipes[0].name, "Telefon B");
  assert.equal(draft.read().plan.recipes[0].name, "Telefon B");
  await b.discardAndReload(); assert.equal(b.state.plan.recipes[0].name, "Telefon A"); assert.equal(draft.read(), null);
});
test("offline changes survive reload and retry without claiming cloud success", async () => {
  const remote = server(), draft = memory(); let offline = true;
  const transport = { ...remote, save: async (...args) => { if (offline) throw new Error("offline"); return remote.save(...args); } };
  const a = new PlanSync(transport, await remote.load(), draft);
  a.update(changed(a, "Offline recept")); await a.flush();
  assert.equal(a.state.status, "error"); assert.equal(a.state.dirty, true);
  const restored = new PlanSync(transport, await remote.load(), draft); offline = false;
  await restored.flush(); assert.equal(restored.state.status, "saved"); assert.equal(draft.read(), null);
  assert.equal((await remote.load()).plan.recipes[0].name, "Offline recept");
});
test("restored draft conflicts safely if another phone saved meanwhile", async () => {
  const remote = server(), draft = memory({ plan: defaultPlan(), revision: 0 });
  await remote.save({ ...defaultPlan(), bought: { flour: 100 } }, 0);
  const sync = new PlanSync(remote, await remote.load(), draft); await sync.flush();
  assert.equal(sync.state.status, "conflict"); assert.equal((await remote.load()).revision, 1); assert.ok(draft.read());
});
test("an incoming slow refresh never replaces a new local edit", async () => {
  const remote = server(); let release;
  const sync = new PlanSync({ ...remote, load: () => new Promise(resolve => { release = resolve; }) }, await remote.load(), memory());
  const fetching = sync.refresh(); sync.update(changed(sync, "Rozpracovaný recept"));
  release({ plan: defaultPlan(), revision: 1 }); await fetching;
  assert.equal(sync.state.plan.recipes[0].name, "Rozpracovaný recept"); assert.equal(sync.state.dirty, true);
});
test("updates made while saving are sent at the next revision", async () => {
  const remote = server(); let release, first = true;
  const sync = new PlanSync({ ...remote, save: async (...args) => { if (first) { first = false; await new Promise(resolve => { release = resolve; }); } return remote.save(...args); } }, await remote.load(), memory());
  sync.update(changed(sync, "První")); const saving = sync.flush();
  sync.update(changed(sync, "Druhá")); release(); await saving;
  assert.equal((await remote.load()).revision, 2); assert.equal((await remote.load()).plan.recipes[0].name, "Druhá"); assert.equal(sync.state.dirty, false);
});
test("open recipe editor defers incoming changes until it closes", async () => {
  const remote = server(); const sync = new PlanSync(remote, await remote.load(), memory());
  sync.setPaused(true); await remote.save({ ...defaultPlan(), bought: { flour: 100 } }, 0);
  await sync.refresh(); assert.equal(sync.state.revision, 0);
  sync.setPaused(false); await sync.refresh(); assert.equal(sync.state.revision, 1);
});
test("failed reload preserves the local draft", async () => {
  const remote = server(), draft = memory(); const sync = new PlanSync({ ...remote, load: async () => { throw new Error("offline"); } }, await remote.load(), draft);
  sync.update(changed(sync, "Zachovat")); await assert.rejects(sync.discardAndReload());
  assert.equal(sync.state.plan.recipes[0].name, "Zachovat"); assert.ok(draft.read());
});
