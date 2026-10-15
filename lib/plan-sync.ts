import type { Plan } from "./plan.ts";
import { validatePlan, MAX_PLAN_CHARS } from "./plan.ts";

export type Snapshot = { plan: Plan; revision: number };
export type Draft = Snapshot;
export type SyncState = Snapshot & { status: "saved" | "saving" | "error" | "conflict"; error: string; dirty: boolean };
export interface PlanTransport {
  load(): Promise<Snapshot>;
  save(plan: Plan, revision: number): Promise<number>;
  watch?(changed: () => void): () => void;
}
export interface DraftStorage { read(): Draft | null; write(draft: Draft): void; clear(): void }
export class PlanConflict extends Error {}
const conflictMessage = "Seznam se mezitím změnil na druhém zařízení. Vaše změny zůstaly v tomto telefonu. Stáhněte jejich zálohu a načtěte aktuální seznam.";

export function browserDrafts(userId: string): DraftStorage {
  const key = `sladke-vanoce-cloud-draft:${userId}`;
  return {
    read() {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const value = JSON.parse(raw);
      if (raw.length > MAX_PLAN_CHARS * 2 || !validatePlan(value.plan) || !Number.isSafeInteger(value.revision) || value.revision < 0) throw new Error("Místní neodeslané změny nelze načíst. Existující záloha nebyla přepsána.");
      return value;
    },
    write(draft) { localStorage.setItem(key, JSON.stringify(draft)); },
    clear() { localStorage.removeItem(key); },
  };
}

// One controller per signed-in user. Only the database can advance a revision.
export class PlanSync {
  state: SyncState;
  private pending: Plan | null = null;
  private working = false;
  private paused = false;
  private stopped = true;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private listeners = new Set<(state: SyncState) => void>();
  private transport: PlanTransport;
  private drafts: DraftStorage;
  constructor(transport: PlanTransport, snapshot: Snapshot, drafts: DraftStorage) {
    this.transport = transport; this.drafts = drafts;
    const draft = drafts.read();
    this.pending = draft?.plan ?? null;
    this.state = { ...(draft ?? snapshot), dirty: !!draft, status: draft ? draft.revision === snapshot.revision ? "saving" : "conflict" : "saved", error: draft && draft.revision !== snapshot.revision ? conflictMessage : "" };
  }
  subscribe(listener: (state: SyncState) => void) { this.listeners.add(listener); listener(this.state); return () => { this.listeners.delete(listener); }; }
  private emit(values: Partial<SyncState>) { this.state = { ...this.state, ...values }; this.listeners.forEach(f => f(this.state)); }
  private cache() {
    try { if (this.pending) this.drafts.write({ plan: this.pending, revision: this.state.revision }); else this.drafts.clear(); }
    catch { this.emit({ error: "Telefon nemá místo pro místní zálohu. Nezavírejte stránku, dokud se změny neuloží, nebo si stáhněte zálohu." }); }
  }
  update(plan: Plan) {
    if (this.state.status === "conflict") return;
    if (!validatePlan(plan) || JSON.stringify(plan).length > MAX_PLAN_CHARS) throw new Error("Seznam je příliš velký nebo neplatný. Odeberte některé obrázky.");
    this.pending = plan;
    this.emit({ plan, dirty: true, status: "saving", error: "" }); this.cache();
    clearTimeout(this.timer); this.timer = setTimeout(() => { void this.flush(); }, 350);
  }
  async flush() {
    if (this.working || this.state.status === "conflict") return;
    if (!this.pending) { await this.refresh(); return; }
    this.working = true; this.emit({ status: "saving", error: "" });
    try {
      while (this.pending) {
        const snapshot: Plan = this.pending;
        const revision = await this.transport.save(snapshot, this.state.revision);
        if (snapshot === this.pending) this.pending = null;
        this.emit({ revision, dirty: !!this.pending }); this.cache();
      }
      this.emit({ status: "saved", error: "" });
    } catch (error) {
      this.emit({ status: error instanceof PlanConflict ? "conflict" : "error", error: error instanceof PlanConflict ? conflictMessage : "Změny zatím nejsou v cloudu. Zkontrolujte internet; po připojení se odeslání zopakuje." });
    } finally { this.working = false; }
  }
  setPaused(paused: boolean) { this.paused = paused; if (!paused && !this.stopped) void this.refresh(); }
  async refresh() {
    if (this.pending || this.working || this.paused) return;
    const before = this.state;
    try {
      const remote = await this.transport.load();
      // An edit or a save may have started while the request was in flight.
      if (this.state !== before || this.pending || this.working || this.paused) return;
      if (remote.revision >= this.state.revision) this.emit({ ...remote, status: "saved", error: "" });
    } catch { if (!this.pending && !this.working) this.emit({ status: "error", error: "Spojení se společným seznamem se přerušilo. Zobrazená data mohou být starší. Obnovení zkusíme automaticky." }); }
  }
  async discardAndReload() {
    if (this.working) throw new Error("Počkejte na dokončení ukládání.");
    const before = this.pending;
    const remote = await this.transport.load();
    if (this.working || this.pending !== before) throw new Error("Během načítání přibyly změny. Zkuste načíst seznam znovu.");
    this.pending = null; this.drafts.clear(); this.emit({ ...remote, dirty: false, status: "saved", error: "" });
  }
  start() {
    this.stopped = false;
    const wake = () => { if (this.pending) void this.flush(); else void this.refresh(); };
    const visible = () => { if (document.visibilityState === "visible") wake(); };
    const unwatch = this.transport.watch?.(() => { void this.refresh(); });
    const poll = setInterval(() => { if (document.visibilityState === "visible") wake(); }, 8000);
    window.addEventListener("online", wake); window.addEventListener("focus", wake); document.addEventListener("visibilitychange", visible);
    wake();
    return () => { this.stopped = true; clearInterval(poll); clearTimeout(this.timer); unwatch?.(); window.removeEventListener("online", wake); window.removeEventListener("focus", wake); document.removeEventListener("visibilitychange", visible); };
  }
}
