import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { plans } from "../db/schema";
import { defaultPlan } from "./plan";
import type { Plan } from "./plan";

export async function loadPlan(userId: string): Promise<{ plan: Plan; revision: number }> {
  const db = getDb();
  await db.insert(plans).values({ userId, data: JSON.stringify(defaultPlan()), updatedAt: new Date().toISOString() }).onConflictDoNothing();
  const [row] = await db.select().from(plans).where(eq(plans.userId, userId));
  return { plan: JSON.parse(row.data), revision: row.revision };
}
