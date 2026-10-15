import Dashboard from "./dashboard";
import { requireChatGPTUser } from "./chatgpt-auth";
import { loadPlan } from "../lib/plan-store";

export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await requireChatGPTUser("/");
  const { plan, revision } = await loadPlan(user.userId);
  return <Dashboard initialPlan={plan} initialRevision={revision} />;
}
