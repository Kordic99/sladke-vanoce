import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import type { Session } from "@supabase/supabase-js";
import { CloudCheck, TreePine, ArrowRight } from "lucide-react";
import Dashboard from "./dashboard";
import { ChristmasLights, ChristmasFriends } from "./festive-scene";
import { supabasePlan } from "../lib/supabase-plan";
import { PlanSync, browserDrafts } from "../lib/plan-sync";
import "./globals.css";
import "./readability.css";
import "./christmas.css";
import "./calendar.css";
import "./mobile.css";
import "./cloud.css";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const client = url && key ? createClient(url, key) : null;

function Welcome({ children }: { children: React.ReactNode }) {
  return <main className="cloud-welcome christmas-theme"><ChristmasLights/><section className="cloud-card"><div className="cloud-brand"><TreePine size={28}/><span>Sladké Vánoce</span></div><div className="cloud-illustration"><ChristmasFriends/></div>{children}</section><p className="cloud-footnote">Naše vánoční kuchyně. Společně, odkudkoliv.</p></main>;
}

function CloudApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [authError, setAuthError] = useState("");
  useEffect(() => {
    if (!client) return;
    let active = true;
    client.auth.getSession().then(({ data, error }) => { if (!active) return; setSession(data.session); setAuthError(error ? "Přihlášení se nepodařilo obnovit. Obnovte stránku a zkuste to znovu." : ""); setReady(true); });
    const { data: { subscription } } = client.auth.onAuthStateChange((_event, next) => { if (active) { setSession(next); setReady(true); } });
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  if (!client) return <Welcome><h1>Kuchyně se připravuje</h1><p>Online propojení ještě není nastavené. Správce musí dokončit připojení společného seznamu.</p></Welcome>;
  if (!ready) return <Welcome><h1>Chviličku…</h1><p role="status">Otevíráme naši vánoční kuchyni.</p></Welcome>;
  if (!session) return <Login initialError={authError}/>;
  return <SignedIn key={session.user.id} session={session}/>;
}

function Login({ initialError }: { initialError: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [message, setMessage] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault(); if (!client || busy) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const result = signup ? await client.auth.signUp({ email: email.trim(), password }) : await client.auth.signInWithPassword({ email: email.trim(), password });
      if (result.error) {
        setError(result.error.code === "email_not_confirmed" ? "Nejdříve potvrďte e-mail od Sladkých Vánoc a potom se přihlaste." : signup ? "Účet se nepodařilo vytvořit. Zkontrolujte e-mail a heslo, případně zkuste přihlášení." : "Přihlášení se nepodařilo. Zkontrolujte e-mail, heslo a připojení.");
      } else if (signup && !result.data.session) { setSignup(false); setPassword(""); setMessage("Potvrďte svůj e-mail od Supabase. Potom se zde přihlaste. Na obou telefonech použijte stejný e-mail a heslo."); }
    } catch { setError("Spojení se nepodařilo. Zkontrolujte internet a zkuste to znovu."); }
    finally { setBusy(false); }
  }
  return <Welcome><div className="eyebrow"><CloudCheck size={15}/>JEDNA KUCHYNĚ. DVA TELEFONY.</div><h1>{signup ? "Naše společné Vánoce" : "Vítejte doma."}</h1><p>{signup ? "Vytvořte jeden účet pro vaši společnou kuchyni." : "Přihlaste se a pokračujte v pečení. Dobroty, nákup i termíny budete mít společné."}</p><form className="cloud-login" onSubmit={submit}><label>E-mail<input type="email" autoComplete="username" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="vas@email.cz"/></label><label>Heslo<input type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 8 : 1} value={password} onChange={e => setPassword(e.target.value)} placeholder={signup ? "Alespoň 8 znaků" : "Vaše heslo"}/></label>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="cloud-message" role="status">{message}</p>}<button type="submit" className="primary-button" disabled={busy}>{busy ? "Chviličku…" : signup ? "Vytvořit společný účet" : "Otevřít naši kuchyni"}<ArrowRight size={17}/></button></form><button className="cloud-switch" disabled={busy} onClick={() => { setSignup(!signup); setError(""); setMessage(""); }}>{signup ? "Už máme účet – přihlásit se" : "Jsme tu poprvé – vytvořit účet"}</button><p className="cloud-login-note">Na obou telefonech použijte stejný účet vytvořený zde v aplikaci.</p></Welcome>;
}

function SignedIn({ session }: { session: Session }) {
  const [sync, setSync] = useState<PlanSync | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const storage = supabasePlan(client!, session.user.id);
    storage.load().then(snapshot => { const controller = new PlanSync(storage, snapshot, browserDrafts(session.user.id)); if (active) { setSync(controller); setError(""); } }).catch(() => { if (active) setError("Společný seznam se nepodařilo načíst. Zkontrolujte připojení a zkuste to znovu. Uložená data zůstala zachovaná."); });
    return () => { active = false; };
  }, [session.user.id, attempt]);
  const signOut = async () => { const { error } = await client!.auth.signOut(); if (error) window.alert("Odhlášení se nepodařilo. Zkuste to znovu."); };
  if (sync) return <Dashboard initialPlan={sync.state.plan} initialRevision={sync.state.revision} sync={sync} account={session.user.email} onSignOut={() => void signOut()}/>;
  return <Welcome><h1>{error ? "Kuchyně je zatím nedostupná" : "Prostíráme stůl…"}</h1><p role={error ? "alert" : "status"}>{error || "Načítáme vaše společné dobroty a nákupní seznam."}</p>{error && <button className="primary-button" onClick={() => { setError(""); setAttempt(n => n + 1); }}>Zkusit znovu</button>}<button className="cloud-switch" onClick={() => void signOut()}>Odhlásit</button></Welcome>;
}

createRoot(document.getElementById("root")!).render(<CloudApp/>);
