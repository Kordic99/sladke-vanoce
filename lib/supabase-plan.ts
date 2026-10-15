import type { SupabaseClient } from "@supabase/supabase-js";
import { defaultPlan, validatePlan, MAX_PLAN_CHARS } from "./plan";
import { PlanConflict } from "./plan-sync";
import type { PlanTransport, Snapshot } from "./plan-sync";

export function supabasePlan(client: SupabaseClient, userId: string): PlanTransport {
  return {
    async load(): Promise<Snapshot> {
      const { data, error } = await client.from("christmas_plans").select("plan,revision").eq("user_id", userId).maybeSingle();
      if (error) throw error;
      if (!data) return { plan: defaultPlan(), revision: 0 };
      if (!validatePlan(data.plan) || !Number.isSafeInteger(data.revision) || data.revision < 1) throw new Error("Uložená data mají neplatný formát. Nebyla přepsána.");
      return { plan: data.plan, revision: data.revision };
    },
    async save(plan, revision) {
      if (!validatePlan(plan) || JSON.stringify(plan).length > MAX_PLAN_CHARS) throw new Error("Neplatný nebo příliš velký seznam.");
      const { data, error } = await client.rpc("save_christmas_plan", { new_plan: plan, expected_revision: revision });
      if (error?.code === "40001") throw new PlanConflict();
      if (error) throw error;
      if (!Number.isSafeInteger(data) || data !== revision + 1) throw new Error("Server nepotvrdil uložení.");
      return data as number;
    },
    watch(changed) {
      const channel = client.channel(`christmas:${userId}`).on("postgres_changes", { event: "*", schema: "public", table: "christmas_plans", filter: `user_id=eq.${userId}` }, changed).subscribe();
      return () => { void client.removeChannel(channel); };
    },
  };
}
