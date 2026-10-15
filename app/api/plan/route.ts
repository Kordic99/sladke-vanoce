import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { plans } from "../../../db/schema";
import { loadPlan } from "../../../lib/plan-store";
import { validatePlan, MAX_PLAN_CHARS } from "../../../lib/plan";

export const dynamic = "force-dynamic";
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return reply({ error: "Přihlaste se pro načtení seznamu." }, 401);
  return reply(await loadPlan(user.userId));
}
export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return reply({ error: "Přihlaste se pro uložení seznamu." }, 401);
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return reply({ error: "Neplatný původ požadavku." }, 403);
  if (request.headers.get("sec-fetch-site") === "cross-site") return reply({ error: "Neplatný požadavek." }, 403);
  const raw = await request.text();
  if (raw.length > MAX_PLAN_CHARS) return reply({ error: "Seznam obsahuje příliš mnoho obrázků. Odeberte některý obrázek a zkuste uložit znovu." }, 413);
  let body;
  try { body = JSON.parse(raw); } catch { return reply({ error: "Neplatný seznam." }, 400); }
  if (!body || typeof body !== "object" || !validatePlan(body.plan) || !Number.isSafeInteger(body.revision) || body.revision < 0) return reply({ error: "Zkontrolujte názvy, množství a jednotky." }, 400);
  const revision = body.revision + 1;
  const result = await getDb().update(plans).set({ data: JSON.stringify(body.plan), revision, updatedAt: new Date().toISOString() }).where(and(eq(plans.userId, user.userId), eq(plans.revision, body.revision))).returning({ revision: plans.revision });
  if (!result.length) return reply({ error: "Seznam se změnil na jiném zařízení. Načtěte aktuální verzi." }, 409);
  return reply({ revision });
}
