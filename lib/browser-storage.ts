import { defaultPlan, validatePlan, MAX_PLAN_CHARS } from "./plan";
import type { Plan } from "./plan";
const key = "sladke-vanoce-plan-v1";
export function loadBrowserPlan(): { plan: Plan; revision: number } {
  const raw = localStorage.getItem(key);
  if (!raw) return { plan: defaultPlan(), revision: 0 };
  const value = JSON.parse(raw);
  if (!validatePlan(value?.plan) || !Number.isSafeInteger(value?.revision) || value.revision < 0) throw new Error("Uložený seznam se nepodařilo načíst.");
  return value;
}
export async function saveBrowserPlan(plan: Plan, revision: number): Promise<Response> {
  const current = loadBrowserPlan();
  if (revision !== current.revision) return Response.json({ error: "Seznam se změnil v jiném okně." }, { status: 409 });
  const serialized = JSON.stringify({ plan, revision: revision + 1 });
  if (serialized.length > MAX_PLAN_CHARS) throw new Error("Seznam obsahuje příliš mnoho obrázků. Odeberte některý obrázek a zkuste uložit znovu.");
  try { localStorage.setItem(key, serialized); }
  catch (error) {
    if (error instanceof Error && error.name === "QuotaExceededError") throw new Error("Úložiště prohlížeče je plné. Stáhněte zálohu svých změn a odeberte některý obrázek.");
    throw error;
  }
  return Response.json({ revision: revision + 1 });
}
