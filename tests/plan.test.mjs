import test from "node:test";
import assert from "node:assert/strict";
import { aggregate, defaultPlan, isBought, parseAmount, validatePlan, MAX_IMAGE_CHARS, uid } from "../lib/plan.ts";

const recipe = (id, ingredients, batches = 1) => ({ id, name: id, art: "rolls", batches, active: true, baked: false, notes: "", ingredients });
const ingredient = (id, name, amount, unit) => ({ id, name, amount, unit });

test("create unique recipe IDs on home Wi-Fi without crypto.randomUUID", () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
  const getRandomValues = crypto.getRandomValues.bind(crypto);
  Object.defineProperty(globalThis, "crypto", { configurable: true, value: { getRandomValues } });
  try {
    const ids = Array.from({ length: 100 }, () => uid());
    assert.equal(new Set(ids).size, 100);
    for (const id of ids) assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.ok(validatePlan({ recipes: [recipe(ids[0], [ingredient(ids[1], "Máslo", 250, "g")])], bought: {} }));
  } finally { Object.defineProperty(globalThis, "crypto", descriptor); }
});
test("sum grams and kilograms with batches and Czech names", () => {
  const p = { recipes: [recipe("a", [ingredient("1", " Hladká   mouka ", 500, "g")]), recipe("b", [ingredient("2", "HLADKÁ MOUKA", .5, "kg")], 2)], bought: {} };
  const rows = aggregate(p); assert.equal(rows.length, 1); assert.equal(rows[0].amount, 1500); assert.equal(rows[0].unit, "g"); assert.equal(rows[0].recipes.length, 2);
});
test("volumes convert, different unit families stay separate", () => {
  const rows = aggregate({ recipes: [recipe("a", [ingredient("1", "Mléko", .5, "l"), ingredient("2", "Mléko", 250, "ml"), ingredient("3", "Mléko", 2, "lžíce"), ingredient("4", "Mléko", 50, "g")])], bought: {} });
  assert.equal(rows.length, 3); assert.equal(rows.find(r => r.unit === "ml").amount, 750);
});
test("exclude inactive recipes without losing their quantities", () => {
  const a = recipe("a", [ingredient("1", "Máslo", 250, "g")]); a.active = false;
  assert.equal(aggregate({ recipes: [a], bought: {} }).length, 0); assert.equal(a.ingredients[0].amount, 250);
});
test("bought quantities remain partial when batches increase", () => {
  const p = { recipes: [recipe("a", [ingredient("1", "Máslo", 250, "g")])], bought: {} };
  const first = aggregate(p)[0]; p.bought[first.key] = first.amount; assert.ok(isBought(aggregate(p)[0]));
  p.recipes[0].batches = 2; const after = aggregate(p)[0]; assert.equal(after.amount - after.purchased, 250); assert.equal(isBought(after), false);
});
test("decimal comma works and floating point totals stay stable", () => {
  assert.equal(parseAmount("0,5"), .5);
  const p = { recipes: [recipe("a", [ingredient("1", "Kakao", .1, "g"), ingredient("2", "Kakao", .2, "g")])], bought: {} };
  assert.equal(aggregate(p)[0].amount, .3);
});
test("reject invalid units, negative quantities and duplicate IDs", () => {
  const p = defaultPlan(); assert.ok(validatePlan(p));
  p.recipes[0].ingredients = [ingredient("1", "Máslo", -1, "g")]; assert.equal(validatePlan(p), false);
  p.recipes[0].ingredients[0].amount = 250; p.recipes[0].ingredients[0].unit = "cups"; assert.equal(validatePlan(p), false);
  p.recipes[0].ingredients[0].unit = "g"; p.recipes.push(p.recipes[0]); assert.equal(validatePlan(p), false);
  assert.equal(validatePlan(null), false);
});
test("old plans stay valid and uploaded images survive a backup round trip", () => {
  const p = defaultPlan(); assert.ok(validatePlan(p));
  p.recipes[0].image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB";
  const restored = JSON.parse(JSON.stringify(p));
  assert.ok(validatePlan(restored)); assert.equal(restored.recipes[0].image, p.recipes[0].image);
});
test("reject unsafe image URLs and oversized embedded images", () => {
  const p = defaultPlan();
  for (const image of ["javascript:alert(1)", "https://example.com/photo.png", "data:image/svg+xml;base64,PHN2Zz4=", "data:image/webp;base64," + "A".repeat(MAX_IMAGE_CHARS)]) {
    p.recipes[0].image = image; assert.equal(validatePlan(p), false);
  }
  p.recipes[0].image = ""; assert.ok(validatePlan(p));
});
