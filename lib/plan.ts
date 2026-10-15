export const units = ["g", "kg", "ml", "l", "ks", "lžička", "lžíce", "balíček"] as const;
export type Unit = typeof units[number];
export type Ingredient = { id: string; name: string; amount: number; unit: Unit };
export const MAX_IMAGE_CHARS = 180000;
export const MAX_PLAN_CHARS = 1600000;
export const eventKinds = ["dough", "bake", "decorate", "shopping", "other"] as const;
export type EventKind = typeof eventKinds[number];
export type CalendarEvent = { id: string; title: string; date: string; time?: string; kind: EventKind; done: boolean };
export type Recipe = { id: string; name: string; art: string; image?: string; events?: CalendarEvent[]; batches: number; active: boolean; baked: boolean; notes: string; ingredients: Ingredient[] };
export type Plan = { recipes: Recipe[]; bought: Record<string, number> };
export type ShoppingItem = { key: string; name: string; unit: Unit; amount: number; purchased: number; recipes: { name: string; amount: number }[] };
export const uid = () => {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  // Home Wi-Fi URLs can use HTTP, where randomUUID is unavailable in Safari.
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64;
  bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, n => n.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
export function defaultPlan(): Plan {
  return { recipes: [
    { id: "rolls", name: "Vanilkové rohlíčky", art: "rolls" },
    { id: "linzer", name: "Linecké cukroví", art: "linzer" },
    { id: "ginger", name: "Perníčky", art: "ginger" },
    { id: "nests", name: "Vosí hnízda", art: "nests" },
  ].map(r => ({ ...r, batches: 1, active: true, baked: false, notes: "", ingredients: [] })), bought: {} };
}
export function normalizeName(name: string) {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase("cs-CZ");
}
export function baseUnit(unit: Unit): { unit: Unit; factor: number } {
  if (unit === "kg") return { unit: "g", factor: 1000 };
  if (unit === "l") return { unit: "ml", factor: 1000 };
  return { unit, factor: 1 };
}
export function aggregate(plan: Plan): ShoppingItem[] {
  const rows = new Map<string, ShoppingItem>();
  for (const recipe of plan.recipes.filter(r => r.active)) {
    for (const ingredient of recipe.ingredients) {
      const { unit, factor } = baseUnit(ingredient.unit);
      const key = JSON.stringify([normalizeName(ingredient.name), unit]);
      const amount = Math.round(ingredient.amount * factor * recipe.batches * 1000000) / 1000000;
      const row = rows.get(key) ?? { key, name: ingredient.name.trim(), unit, amount: 0, purchased: Math.max(0, plan.bought[key] ?? 0), recipes: [] };
      row.amount = Math.round((row.amount + amount) * 1000000) / 1000000;
      const source = row.recipes.find(r => r.name === recipe.name);
      if (source) source.amount += amount; else row.recipes.push({ name: recipe.name, amount });
      rows.set(key, row);
    }
  }
  return [...rows.values()].sort((a, b) => a.name.localeCompare(b.name, "cs"));
}
export function isBought(item: ShoppingItem) { return item.purchased + 0.000001 >= item.amount; }
const numberFormat = new Intl.NumberFormat("cs-CZ", { maximumFractionDigits: 3 });
export function quantity(amount: number, unit: Unit): string {
  if (unit === "g" && amount >= 1000) return `${numberFormat.format(amount / 1000)} kg`;
  if (unit === "ml" && amount >= 1000) return `${numberFormat.format(amount / 1000)} l`;
  return `${numberFormat.format(amount)} ${unit}`;
}
export function parseAmount(value: string) { return Number(value.trim().replace(",", ".")); }
export function isISODate(value: unknown): value is string {
  if (typeof value !== "string" || !/^[1-9]\d{3}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
export function validateEvents(value: unknown): value is CalendarEvent[] {
  if (!Array.isArray(value) || value.length > 100) return false;
  const ids = new Set<string>();
  for (const e of value) {
    if (!e || typeof e.id !== "string" || !e.id || e.id.length > 100 || ids.has(e.id) || typeof e.title !== "string" || !e.title.trim() || e.title.length > 120 || !isISODate(e.date) || (e.time !== undefined && e.time !== "" && (typeof e.time !== "string" || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(e.time))) || !eventKinds.includes(e.kind) || typeof e.done !== "boolean") return false;
    ids.add(e.id);
  }
  return true;
}
export function validatePlan(value: unknown): value is Plan {
  if (!value || typeof value !== "object") return false;
  const p = value as Plan;
  if (!Array.isArray(p.recipes) || p.recipes.length > 100 || !p.bought || typeof p.bought !== "object" || Array.isArray(p.bought)) return false;
  if (Object.keys(p.bought).length > 10000 || Object.values(p.bought).some(n => typeof n !== "number" || !Number.isFinite(n) || n < 0 || n > 1e12)) return false;
  const recipeIds = new Set<string>();
  for (const r of p.recipes) {
    if (!r || typeof r.id !== "string" || !r.id || r.id.length > 100 || recipeIds.has(r.id) || typeof r.name !== "string" || !r.name.trim() || r.name.length > 100 || typeof r.art !== "string" || !["rolls", "linzer", "ginger", "nests", "stars", "coconut"].includes(r.art) || typeof r.notes !== "string" || r.notes.length > 5000 || typeof r.active !== "boolean" || typeof r.baked !== "boolean" || !Number.isFinite(r.batches) || r.batches <= 0 || r.batches > 100 || !Array.isArray(r.ingredients) || r.ingredients.length > 100) return false;
    recipeIds.add(r.id);
    if (r.events !== undefined && !validateEvents(r.events)) return false;
    if (r.image !== undefined && r.image !== "" && (typeof r.image !== "string" || r.image.length > MAX_IMAGE_CHARS || !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(r.image))) return false;
    const ids = new Set<string>();
    for (const i of r.ingredients) {
      if (!i || typeof i.id !== "string" || !i.id || i.id.length > 100 || ids.has(i.id) || typeof i.name !== "string" || !i.name.trim() || i.name.length > 100 || !units.includes(i.unit) || !Number.isFinite(i.amount) || i.amount <= 0 || i.amount > 1e7) return false;
      ids.add(i.id);
    }
  }
  return true;
}
