"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { TreePine, LayoutDashboard, Cookie, ShoppingBasket, Plus, ArrowUpRight, ArrowRight, Check, CloudCheck, CloudUpload, CircleAlert, Minus, Search, Printer, X, Trash2, Download, Sparkles, ChefHat, CheckCheck, Folder, Menu, Leaf, RefreshCw, ImagePlus, Pause, Play, CalendarDays, Bell, BrushCleaning } from "lucide-react";
import { aggregate, isBought, normalizeName, parseAmount, quantity, uid, units, validatePlan, validateEvents, MAX_PLAN_CHARS } from "../lib/plan";
import { loadBrowserPlan, saveBrowserPlan } from "../lib/browser-storage";
import type { PlanSync } from "../lib/plan-sync";
import type { Plan, Recipe, ShoppingItem, Unit, CalendarEvent } from "../lib/plan";
import { CookieArt } from "./artwork";
import { ChristmasFriends, ChristmasLights, NorthPoleExpress, SnowyChristmasTree } from "./festive-scene";
import { ChristmasCountdown } from "./christmas-countdown";
import { MobileGuide } from "./mobile-guide";
import { prepareRecipeImage } from "../lib/recipe-image";
import { CleaningView } from "./cleaning";

import { calendarEntries } from "../lib/calendar";
import type { CalendarEntry } from "../lib/calendar";
import { CalendarView, UpcomingPanel, RecipeScheduleFields, EventDialog, DailyReminder, useToday } from "./calendar";
import type { EventEditorState } from "./calendar";

type View = "overview" | "recipes" | "shopping" | "calendar" | "cleaning";
type SaveStatus = "saved" | "saving" | "error" | "conflict";
const plural = (n: number, one: string, few: string, many: string) => `${n.toLocaleString("cs-CZ")} ${n === 1 ? one : !Number.isInteger(n) || n >= 2 && n <= 4 ? few : many}`;
const illustrations = ["rolls", "linzer", "ginger", "nests", "stars", "coconut"];
const commonIngredients = ["Hladká mouka", "Polohrubá mouka", "Máslo", "Moučkový cukr", "Cukr krupice", "Vejce", "Žloutky", "Vlašské ořechy", "Mleté mandle", "Kakao", "Med", "Vanilkový cukr", "Skořice", "Strouhaný kokos", "Piškoty", "Rum", "Mléko", "Čokoláda", "Rybízová marmeláda"];

export default function Dashboard({ initialPlan, initialRevision, browserStorage = false, sync, account, onSignOut }: { initialPlan: Plan; initialRevision: number; browserStorage?: boolean; sync?: PlanSync; account?: string; onSignOut?: () => void }) {
  const [plan, setPlan] = useState(initialPlan);
  const [view, setView] = useState<View>("overview");
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<Recipe | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [notice, setNotice] = useState("");
  const [animations, setAnimations] = useState(true);
  const [eventEditor, setEventEditor] = useState<EventEditorState | null>(null);
  const [showToday, setShowToday] = useState(false);
  const [cleaningEditing, setCleaningEditing] = useState(false);
  const today = useToday();
  const entries = useMemo(() => calendarEntries(plan), [plan]);
  const todayCount = entries.filter(e => e.date === today && !e.done).length;
  const data = useRef(plan);
  const revision = useRef(initialRevision);
  const pending = useRef<Plan | null>(null);
  const working = useRef(false);
  const conflict = useRef(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const importFile = useRef<HTMLInputElement>(null);
  const shopping = useMemo(() => aggregate(plan), [plan]);
  const bought = shopping.filter(isBought).length;
  const activeRecipes = plan.recipes.filter(r => r.active);
  const baked = activeRecipes.filter(r => r.baked).length;
  const progress = shopping.length ? Math.round(bought / shopping.length * 100) : 0;

  async function save() {
    if (sync) { await sync.flush(); return; }
    if (working.current || conflict.current || !pending.current) return;
    working.current = true;
    setStatus("saving");
    try {
      while (pending.current) {
        const snapshot: Plan = pending.current;
        const response = browserStorage ? await saveBrowserPlan(snapshot, revision.current) : await fetch("/api/plan", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: snapshot, revision: revision.current }) });
        if (response.status === 409) { conflict.current = true; setStatus("conflict"); setError("Seznam se změnil v jiném okně nebo na jiném zařízení. Než budete pokračovat, stáhněte zálohu svých změn a načtěte aktuální seznam."); return; }
        if (!response.ok) {
          const detail = await response.json().catch(() => null) as { error?: string } | null;
          throw new Error(detail?.error || "Nepodařilo se uložit změny. Zkontrolujte připojení a zkuste to znovu.");
        }
        const result = await response.json() as { revision: number };
        revision.current = result.revision;
        if (pending.current === snapshot) pending.current = null;
      }
      setStatus("saved"); setError("");
    } catch (e) { setStatus("error"); setError(e instanceof Error ? e.message : "Změny se nepodařilo uložit."); }
    finally { working.current = false; }
  }
  function update(fn: (p: Plan) => Plan) {
    if (conflict.current) return;
    const next = fn(data.current);
    if (sync) { try { sync.update(next); } catch (e) { setNotice(e instanceof Error ? e.message : "Změnu nelze uložit."); } return; }
    data.current = next;
    pending.current = next;
    setPlan(next);
    setStatus("saving");
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => { void save(); }, 350);
  }
  useEffect(() => {
    if (!sync) return;
    const unsubscribe = sync.subscribe(state => {
      data.current = state.plan; revision.current = state.revision; pending.current = state.dirty ? state.plan : null;
      conflict.current = state.status === "conflict";
      setPlan(state.plan); setStatus(state.status); setError(state.error);
    });
    const stop = sync.start();
    return () => { stop(); unsubscribe(); };
  }, [sync]);
  useEffect(() => { sync?.setPaused(!!editor || !!eventEditor || cleaningEditing); }, [sync, editor, eventEditor, cleaningEditing]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => { if (pending.current) { event.preventDefault(); event.returnValue = ""; } };
    const online = () => { void save(); };
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("online", online);
    return () => { window.removeEventListener("beforeunload", beforeUnload); window.removeEventListener("online", online); if (debounce.current) clearTimeout(debounce.current); };
  }, []);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 3500); return () => clearTimeout(t); }, [notice]);
  useEffect(() => { try { setAnimations(localStorage.getItem("sladke-vanoce-motion") !== "off"); } catch {} }, []);
  function toggleAnimations() {
    const next = !animations; setAnimations(next);
    try { localStorage.setItem("sladke-vanoce-motion", next ? "on" : "off"); } catch {}
  }

  function navigate(next: View) { setView(next); setMobileMenu(false); setSearch(""); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function openRecipe(r: Recipe) { if (conflict.current) return; setIsNew(false); setEditor(structuredClone(r)); setMobileMenu(false); }
  function newRecipe() {
    if (conflict.current) return;
    if (plan.recipes.length >= 100) { setNotice("V seznamu může být nejvýše 100 dobrot."); return; }
    setIsNew(true); setEditor({ id: uid(), name: "", art: "stars", batches: 1, active: true, baked: false, notes: "", ingredients: [] });
  }
  function changeRecipe(id: string, values: Partial<Recipe>) { update(p => ({ ...p, recipes: p.recipes.map(r => r.id === id ? { ...r, ...values } : r) })); }
  function addEvent(date: string) {
    if (conflict.current) return;
    if (!plan.recipes.length) { navigate("recipes"); setNotice("Nejprve přidejte dobrotu, ke které bude termín patřit."); return; }
    setEventEditor({ recipeId: plan.recipes[0].id, date });
  }
  function editEvent(entry: CalendarEntry) { if (!conflict.current) setEventEditor({ recipeId: entry.recipeId, date: entry.date, entry }); }
  function toggleEvent(entry: CalendarEntry) {
    update(p => ({ ...p, recipes: p.recipes.map(r => r.id === entry.recipeId ? { ...r, events: (r.events || []).map(e => e.id === entry.id ? { ...e, done: !e.done } : e) } : r) }));
  }
  function saveEvent(recipeId: string, event: CalendarEvent) {
    const old = eventEditor?.entry;
    update(p => ({ ...p, recipes: p.recipes.map(r => {
      const events = (r.events || []).filter(e => !(old && r.id === old.recipeId && e.id === old.id));
      return r.id === recipeId ? { ...r, events: [...events, event] } : old && r.id === old.recipeId ? { ...r, events } : r;
    }) }));
    setEventEditor(null); setNotice("Termín je uložený v kalendáři.");
  }
  function deleteEvent() {
    const entry = eventEditor?.entry;
    if (entry) update(p => ({ ...p, recipes: p.recipes.map(r => r.id === entry.recipeId ? { ...r, events: (r.events || []).filter(e => e.id !== entry.id) } : r) }));
    setEventEditor(null); setNotice("Termín byl odebrán.");
  }
  function toggleBought(item: ShoppingItem) { update(p => ({ ...p, bought: { ...p.bought, [item.key]: isBought(item) ? 0 : item.amount } })); }
  function backup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(data.current, null, 2)], { type: "application/json" }));
    const a = document.createElement("a"); a.href = url; a.download = "sladke-vanoce-zaloha.json"; a.click(); URL.revokeObjectURL(url);
    setNotice("Záloha byla stažena.");
  }
  async function reload() {
    try {
      if (sync) {
        if (sync.state.dirty && !window.confirm("Načíst společný seznam a zahodit místní neodeslané změny? Pokud je chcete zachovat, nejdříve stáhněte zálohu změn.")) return;
        await sync.discardAndReload(); setEditor(null); setEventEditor(null); return;
      }
      let result: { plan: Plan; revision: number };
      if (browserStorage) result = loadBrowserPlan();
      else { const response = await fetch("/api/plan"); if (!response.ok) throw new Error(); result = await response.json() as { plan: Plan; revision: number }; }
      data.current = result.plan; revision.current = result.revision; pending.current = null; conflict.current = false;
      setPlan(result.plan); setStatus("saved"); setError(""); setEditor(null); setEventEditor(null);
    } catch { setError("Aktuální seznam se nepodařilo načíst. Zkuste to znovu."); }
  }
  const visibleRecipes = plan.recipes.filter(r => r.name.toLocaleLowerCase("cs").includes(search.toLocaleLowerCase("cs")));
  async function importBackup(file: File | undefined) {
    if (!file) return;
    try {
      if (file.size > MAX_PLAN_CHARS * 2) throw new Error();
      const value = JSON.parse(await file.text());
      if (!validatePlan(value)) throw new Error();
      if (window.confirm("Nahradit současný seznam touto zálohou? Před nahrazením si můžete současný seznam stáhnout tlačítkem Stáhnout zálohu.")) { update(() => value); setNotice("Záloha byla načtena."); }
    } catch { setNotice("Soubor není platná záloha dashboardu."); }
    if (importFile.current) importFile.current.value = "";
  }
  const visibleShopping = shopping.filter(item => item.name.toLocaleLowerCase("cs").includes(search.toLocaleLowerCase("cs")) && (filter === "all" || (filter === "bought" ? isBought(item) : !isBought(item))));

  return <div className={`app-shell christmas-theme ${animations ? "" : "no-motion"}`}>
    {mobileMenu && <button className="nav-scrim" aria-label="Zavřít nabídku" onClick={() => setMobileMenu(false)} />}
    <aside className={`sidebar ${mobileMenu ? "open" : ""}`}>
      <a className="brand" href="#" onClick={e => { e.preventDefault(); navigate("overview"); }}><span className="brand-icon"><TreePine size={26} strokeWidth={1.5}/><i/></span><span>Sladké<br/>Vánoce<span className="brand-sub">NAŠE VÁNOČNÍ KUCHYNĚ</span></span></a>
      <nav aria-label="Hlavní nabídka" className="main-nav">
        <button className={view === "overview" ? "selected" : ""} onClick={() => navigate("overview")}><LayoutDashboard size={19}/>Přehled</button>
        <button className={view === "recipes" ? "selected" : ""} onClick={() => navigate("recipes")}><Cookie size={19}/>Moje dobroty<span className="nav-count">{plan.recipes.length}</span></button>
        <button className={view === "shopping" ? "selected" : ""} onClick={() => navigate("shopping")}><ShoppingBasket size={19}/>Nákupní seznam{shopping.length > bought && <span className="nav-count">{shopping.length - bought}</span>}</button>
        <button className={view === "calendar" ? "selected" : ""} onClick={() => navigate("calendar")}><CalendarDays size={19}/>Kalendář{todayCount > 0 && <span className="nav-count">{todayCount}</span>}</button>
        <button className={view === "cleaning" ? "selected" : ""} onClick={() => navigate("cleaning")}><BrushCleaning size={19}/>Úklid</button>
      </nav>
      <div className="folders-label">VAŠE DOBROTY <button title="Přidat dobrotu" aria-label="Přidat dobrotu" onClick={newRecipe}><Plus size={15}/></button></div>
      <div className="folder-list">{plan.recipes.map(r => <button key={r.id} onClick={() => openRecipe(r)}><Folder size={15}/><span>{r.name}</span>{r.baked && <Check size={14} className="folder-check"/>}</button>)}</div>
      <button className="sidebar-add" onClick={newRecipe}><Plus size={16}/>Nová dobrota</button>
      <div className="sidebar-bottom"><div className="sidebar-note"><SnowyChristmasTree/><p>Nejhezčí Vánoce<br/>voní po domově.</p><span>A po něčem sladkém.</span></div><div className="sidebar-season"><span className="season-dot"/>Naše vánoční pečení<span>2026</span></div></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="topbar-left"><button className="mobile-toggle icon-button" aria-label="Otevřít nabídku" onClick={() => setMobileMenu(true)}><Menu size={22}/></button><span>VÁNOCE PODLE NAŠÍ CHUTI</span></div><div className="topbar-right"><button className="today-bell" aria-label={`Dnešní připomenutí, nesplněné úkoly: ${todayCount}`} onClick={() => setShowToday(true)} title="Dnešní připomenutí"><Bell size={18}/>{todayCount > 0 && <b>{todayCount}</b>}</button><button className="animation-toggle" onClick={toggleAnimations} aria-pressed={animations} aria-label={animations ? "Vypnout vánoční animace" : "Zapnout vánoční animace"} title={animations ? "Vypnout animace" : "Zapnout animace"}>{animations ? <Pause size={14}/> : <Play size={14}/>}<span>Animace</span></button><span className={`save-status ${status}`} role="status">{status === "saved" ? <CloudCheck size={16}/> : status === "saving" ? <CloudUpload size={16}/> : <CircleAlert size={16}/>}<span>{status === "saved" ? "Vše uloženo" : status === "saving" ? "Ukládám…" : "Neuložené změny"}</span></span><span className="season-tag"><Sparkles size={13}/>Vánoce 2026</span></div><ChristmasLights/></header>
      <main>
        {sync && <div className="cloud-account"><span><CloudCheck size={15}/><span>Společný seznam <small>{account}</small></span></span><button onClick={() => { if (sync.state.dirty || editor || eventEditor || cleaningEditing) { setNotice("Nejprve uložte nebo zavřete rozepsané změny. Neodeslaný seznam můžete stáhnout jako zálohu."); return; } onSignOut?.(); }}>Odhlásit</button></div>}
        {!!error && <div className="error-banner" role="alert"><CircleAlert size={20}/><p>{error}</p>{status === "conflict" ? <><button onClick={backup}><Download size={15}/>Záloha změn</button><button onClick={() => void reload()}><RefreshCw size={15}/>Načíst aktuální</button></> : <button onClick={() => void save()}>Zkusit znovu</button>}</div>}
        {view === "overview" ? <>
          <section className="hero festive-hero"><div className="hero-copy"><div className="eyebrow"><Sparkles size={12}/>MALÝ PLÁN. VELKÉ VÁNOCE.</div><ChristmasCountdown/><p>Cukroví, salát i rodinné speciality.<br className="desktop-break"/> Všechny suroviny pohromadě, ať nám nic nechybí.</p><button className="text-link" onClick={() => navigate("shopping")}>Hurá na vánoční nákup <ArrowRight size={16}/></button></div><ChristmasFriends/></section><NorthPoleExpress/><UpcomingPanel plan={plan} today={today} onCalendar={() => navigate("calendar")} onAdd={addEvent} onEdit={editEvent} onToggle={toggleEvent}/>
          <section className="stats-grid" aria-label="Přehled pečení"><Stat icon={<Cookie size={22}/>} value={activeRecipes.length} label="dobrot v plánu" note={`${plan.recipes.length} celkem v kuchařce`} color="green"/><Stat icon={<ShoppingBasket size={22}/>} value={shopping.length} label="surovin na seznamu" note="Sečteno ze všech dávek" color="gold"/><Stat icon={<CheckCheck size={22}/>} value={<>{bought}<small> / {shopping.length}</small></>} label="položek nakoupeno" note={shopping.length ? `${progress} % nákupu je hotovo` : "Nákupní seznam čeká na suroviny"} color="red"/><Stat icon={<ChefHat size={22}/>} value={<>{baked}<small> / {activeRecipes.length}</small></>} label="dobrot hotovo" note="Každá dobrota se počítá" color="green"/></section>
          <div className="section-heading"><div><h2>Naše dobroty <span>{plan.recipes.length}</span></h2><p>Cukroví i salát mají své místo. Suroviny se sečtou samy.</p></div><button className="primary-button" onClick={newRecipe}><Plus size={17}/>Přidat dobrotu</button></div>
          <div className="recipe-grid">{plan.recipes.slice(0, 4).map(r => <RecipeCard key={r.id} recipe={r} open={() => openRecipe(r)} change={v => changeRecipe(r.id, v)} shopping={shopping}/>)}{plan.recipes.length === 0 && <EmptyRecipes onAdd={newRecipe}/>}</div>
          {plan.recipes.length > 4 && <button className="see-all text-link" onClick={() => navigate("recipes")}>Zobrazit všechny dobroty <ArrowRight size={16}/></button>}
          <div className="lower-grid"><section className="shopping-preview panel"><div className="panel-heading"><div className="heading-with-icon"><ShoppingBasket size={20}/><h2>Co ještě nakoupit</h2></div><button className="text-link" onClick={() => navigate("shopping")}>Celý seznam <ArrowUpRight size={16}/></button></div>{shopping.length ? <><Progress value={progress} bought={bought} total={shopping.length}/><div className="preview-rows">{shopping.filter(i => !isBought(i)).slice(0, 5).map(i => <ShoppingRow key={i.key} item={i} onToggle={() => toggleBought(i)} compact/>)}{bought === shopping.length && <div className="all-done"><CheckCheck size={32}/><h3>Všechno je nakoupené!</h3><p>Teď už jen rozehřát troubu.</p></div>}</div></> : <div className="shopping-empty"><span className="empty-icon"><ShoppingBasket size={28} strokeWidth={1.3}/></span><h3>Tady začne váš nákup</h3><p>Doplňte suroviny k prvnímu cukroví.<br/>Společný seznam se vytvoří automaticky.</p><button className="text-link" onClick={() => plan.recipes[0] ? openRecipe(plan.recipes[0]) : newRecipe()}>Doplnit první suroviny <ArrowRight size={16}/></button></div>}</section><aside className="tip-panel"><span className="tip-icon"><Leaf size={21}/></span><div className="eyebrow">MALÝ POMOCNÍK DO KUCHYNĚ</div><h2>Jedna surovina.<br/>Jeden společný součet.</h2><p>Máslo do rohlíčků i lineckého? V nákupním seznamu najdete celkové množství, včetně všech dávek.</p><div className="tip-rule"/><p className="tip-small">Používejte stejné názvy surovin.<br/>Gramy a kilogramy přepočítáme za vás.</p><span className="tip-sparkle">✧</span></aside></div>
        </> : view === "recipes" ? <>
          <div className="page-heading"><div className="eyebrow">VAŠE VÁNOČNÍ KUCHAŘKA</div><div className="title-row"><div><h1>Naše <em>dobroty.</em></h1><p>Cukroví, salát i speciality. Vlastní recepty, obrázky a libovolný počet dávek.</p></div><button className="primary-button" onClick={newRecipe}><Plus size={17}/>Přidat dobrotu</button></div></div>
          <div className="view-toolbar"><SearchBox value={search} onChange={setSearch} placeholder="Najít dobrotu…"/><span>{plural(plan.recipes.length, "druh v kuchařce", "druhy v kuchařce", "druhů v kuchařce")}</span></div>
          <div className="recipe-grid full">{visibleRecipes.map(r => <RecipeCard key={r.id} recipe={r} open={() => openRecipe(r)} change={v => changeRecipe(r.id, v)} shopping={shopping}/>)}{plan.recipes.length === 0 ? <EmptyRecipes onAdd={newRecipe}/> : visibleRecipes.length === 0 && <div className="no-results">Žádná dobrota s tímto názvem. <button onClick={() => setSearch("")}>Zrušit hledání</button></div>}</div>
        </> : view === "calendar" ? <CalendarView plan={plan} today={today} onAdd={addEvent} onEdit={editEvent} onToggle={toggleEvent}/> : view === "cleaning" ? <CleaningView tasks={plan.cleaningTasks || []} today={today} disabled={status === "conflict"} onEditing={setCleaningEditing} onChange={fn => update(p => ({ ...p, cleaningTasks: fn(p.cleaningTasks || []) }))}/> : <>
          <div className="page-heading"><div className="eyebrow">VŠECHNY SUROVINY POHROMADĚ</div><div className="title-row"><div><h1>Nákupní <em>seznam.</em></h1><p>Sečteno ze všech dobrot a dávek. Stačí nakoupit a odškrtnout.</p></div><button className="secondary-button print-button" onClick={() => window.print()}><Printer size={17}/>Vytisknout</button></div></div>
          <section className="shopping-summary"><div><span className="summary-icon"><ShoppingBasket size={24}/></span><div><h3>{shopping.length ? bought === shopping.length ? "Máme všechno. Můžeme péct!" : `Ještě ${plural(shopping.length - bought, "položka", "položky", "položek")} a jde se péct.` : "Začněte surovinami do svého cukroví."}</h3><p>{bought} z {shopping.length} položek nakoupeno · {plural(activeRecipes.length, "dobrota", "dobroty", "dobrot")} v plánu</p></div></div><div className="summary-progress"><span>{progress} %</span><div className="progress-track"><i style={{ width: `${progress}%` }}/></div></div></section>
          <div className="shopping-layout"><section className="shopping-table panel"><div className="shopping-toolbar"><div className="filters" role="group" aria-label="Filtrovat nákup"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Vše <span>{shopping.length}</span></button><button className={filter === "missing" ? "active" : ""} onClick={() => setFilter("missing")}>K nákupu <span>{shopping.length - bought}</span></button><button className={filter === "bought" ? "active" : ""} onClick={() => setFilter("bought")}>Nakoupeno <span>{bought}</span></button></div><SearchBox value={search} onChange={setSearch} placeholder="Najít surovinu…"/></div><div className="table-header"><span>SUROVINA A CUKROVÍ</span><span>CELKEM</span></div><div className="shopping-rows">{visibleShopping.map(i => <ShoppingRow key={i.key} item={i} onToggle={() => toggleBought(i)}/>)}{shopping.length === 0 ? <div className="shopping-empty"><span className="empty-icon"><ShoppingBasket size={32} strokeWidth={1.3}/></span><h3>Nákupní seznam je zatím prázdný</h3><p>Přidejte suroviny k jednotlivým dobrotám.<br/>Celková množství se tu objeví automaticky.</p><button className="primary-button" onClick={() => navigate("recipes")}>Přejít na dobroty <ArrowRight size={16}/></button></div> : visibleShopping.length === 0 && <div className="no-results">{filter === "bought" ? "Zatím není nic odškrtnuté." : filter === "missing" && !search ? "Vše už máte nakoupené. Krásné pečení!" : "Žádná surovina neodpovídá hledání."}</div>}</div><div className="table-footer"><CloudCheck size={14}/>Změny se ukládají automaticky.</div></section><aside className="shopping-aside"><section className="panel included-panel"><h3><Cookie size={18}/>Počítáme s těmito dobrotami</h3>{plan.recipes.map(r => <label className="included-row" key={r.id}><input type="checkbox" checked={r.active} onChange={e => changeRecipe(r.id, { active: e.target.checked })}/><span>{r.name}<small>{plural(r.batches, "dávka", "dávky", "dávek")} · {plural(r.ingredients.length, "surovina", "suroviny", "surovin")}</small></span></label>)}{!plan.recipes.length && <p>Nejprve přidejte dobrota.</p>}</section><div className="shopping-help"><Sparkles size={19}/><p>Stejné názvy se slučují. <strong>g + kg</strong> a <strong>ml + l</strong> se přepočítají; kusy, lžíce a balíčky zůstávají zvlášť.</p><p>Pokud zvýšíte dávky, nakoupené množství se zachová a uvidíte, kolik ještě zbývá.</p></div></aside></div>
        </>}
        <footer className="page-footer"><span><TreePine size={14}/>{browserStorage ? "Seznam se ukládá v tomto prohlížeči." : "S klidem, s láskou, s cukrovím."}</span><div className="backup-actions"><MobileGuide browserStorage={browserStorage}/><input ref={importFile} type="file" accept=".json,application/json" hidden onChange={e => void importBackup(e.target.files?.[0])}/><button onClick={() => importFile.current?.click()}><RefreshCw size={14}/>Načíst zálohu</button><button onClick={backup}><Download size={14}/>Stáhnout zálohu</button></div></footer>
      </main>
    </div>
    <nav className="mobile-bottom-nav" aria-label="Mobilní nabídka">
      <button aria-current={view === "overview" ? "page" : undefined} onClick={() => navigate("overview")}><LayoutDashboard size={21}/><span>Přehled</span></button>
      <button aria-current={view === "recipes" ? "page" : undefined} onClick={() => navigate("recipes")}><Cookie size={21}/><span>Dobroty</span></button>
      <button aria-current={view === "shopping" ? "page" : undefined} onClick={() => navigate("shopping")}><ShoppingBasket size={21}/><span>Nákup</span>{shopping.length > bought && <b>{shopping.length - bought}</b>}</button>
      <button aria-current={view === "calendar" ? "page" : undefined} onClick={() => navigate("calendar")}><CalendarDays size={21}/><span>Kalendář</span>{todayCount > 0 && <b>{todayCount}</b>}</button>
      <button aria-current={view === "cleaning" ? "page" : undefined} onClick={() => navigate("cleaning")}><BrushCleaning size={21}/><span>Úklid</span></button>
    </nav>
    {editor && <RecipeEditor key={editor.id} recipe={editor} isNew={isNew} names={[...new Set([...commonIngredients, ...plan.recipes.flatMap(r => r.ingredients.map(i => i.name))])]} onClose={() => setEditor(null)} onSave={r => { update(p => ({ ...p, recipes: isNew ? [...p.recipes, r] : p.recipes.map(x => x.id === r.id ? r : x) })); setEditor(null); setNotice(isNew ? "Nová dobrota je v kuchařce." : "Dobrota i její termíny jsou uložené."); }} onDelete={() => { update(p => ({ ...p, recipes: p.recipes.filter(r => r.id !== editor.id) })); setEditor(null); setNotice("Dobrota byla odebrána z plánu."); }}/>}
    {eventEditor && <EventDialog plan={plan} state={eventEditor} onClose={() => setEventEditor(null)} onSave={saveEvent} onDelete={deleteEvent}/>}
    <DailyReminder key={today} today={today} entries={entries} paused={!!editor || !!eventEditor || cleaningEditing} manual={showToday} onManualClose={() => setShowToday(false)} onCalendar={() => navigate("calendar")} onToggle={toggleEvent}/>
    {notice && <div className="toast" role="status"><Check size={17}/>{notice}</div>}
    <div className="print-footer">Sladké Vánoce · Nákupní seznam pro naše vánoční pečení</div>
  </div>;
}

function Stat({ icon, value, label, note, color }: { icon: React.ReactNode; value: React.ReactNode; label: string; note: string; color: string }) {
  return <div className="stat"><span className={`stat-icon ${color}`}>{icon}</span><div className="stat-value">{value}</div><div className="stat-label">{label}</div><p>{note}</p></div>;
}
function Progress({ value, bought, total }: { value: number; bought: number; total: number }) {
  return <div className="progress-block"><div><span>{bought} z {total} položek nakoupeno</span><strong>{value} %</strong></div><div className="progress-track"><i style={{ width: `${value}%` }}/></div></div>;
}
function RecipeCard({ recipe: r, open, change, shopping }: { recipe: Recipe; open: () => void; change: (v: Partial<Recipe>) => void; shopping: ShoppingItem[] }) {
  const ready = r.ingredients.length > 0 && r.ingredients.every(i => {
    const item = shopping.find(x => normalizeName(x.name) === normalizeName(i.name) && (x.unit === i.unit || (x.unit === "g" && i.unit === "kg") || (x.unit === "ml" && i.unit === "l")));
    return !!item && isBought(item);
  });
  return <article className={`recipe-card ${!r.active ? "inactive" : ""}`}><button className={`card-art ${r.art}`} onClick={open} aria-label={`Otevřít ${r.name}`}>{r.image ? <img className="card-custom-image" src={r.image} alt={r.name}/> : <CookieArt kind={r.art}/>}<span className={`card-badge ${r.baked ? "baked" : ready ? "ready" : ""}`}>{r.baked ? <><Check size={12}/>Hotovo</> : !r.active ? "Mimo plán" : ready ? <><Check size={12}/>Suroviny máme</> : "V plánu"}</span><span className="card-open"><ArrowUpRight size={17}/></span></button><div className="card-body"><button className="card-title" onClick={open}>{r.name}</button><p>{r.ingredients.length ? plural(r.ingredients.length, "surovina", "suroviny", "surovin") : "Přidejte vlastní suroviny"}</p><div className="card-controls"><span>Dávky</span><div className="stepper"><button aria-label={`Ubrat dávku ${r.name}`} disabled={r.batches <= .5} onClick={() => change({ batches: Math.max(.5, r.batches - .5) })}><Minus size={13}/></button><span>{r.batches.toLocaleString("cs")}</span><button aria-label={`Přidat dávku ${r.name}`} disabled={r.batches >= 100} onClick={() => change({ batches: Math.min(100, r.batches + .5) })}><Plus size={13}/></button></div><button className={`baked-button ${r.baked ? "checked" : ""}`} aria-label={r.baked ? `Označit ${r.name} jako nedokončené` : `Označit ${r.name} jako hotové`} title={r.baked ? "Hotovo" : "Označit jako hotové"} onClick={() => change({ baked: !r.baked })}><ChefHat size={18}/></button></div><button className="card-footer" onClick={open}>{r.ingredients.length ? "Suroviny a poznámky" : "Doplnit suroviny"}<ArrowRight size={15}/></button></div></article>;
}
function ShoppingRow({ item, onToggle, compact = false }: { item: ShoppingItem; onToggle: () => void; compact?: boolean }) {
  const checked = isBought(item);
  return <div className={`shopping-row ${checked ? "purchased" : ""} ${compact ? "compact" : ""}`}><label className="shopping-label"><input type="checkbox" checked={checked} onChange={onToggle} aria-label={`${item.name} – ${quantity(item.amount, item.unit)} nakoupeno`}/><span><strong>{item.name}</strong>{compact ? <small>{plural(item.recipes.length, "dobrota", "dobroty", "dobrot")}</small> : <small>{item.recipes.map((r, index) => <span key={`${r.name}-${index}`} className="source-tag">{r.name} <b>{quantity(r.amount, item.unit)}</b></span>)}</small>}</span></label><div className="shopping-quantity"><strong>{quantity(item.amount, item.unit)}</strong>{!checked && item.purchased > 0 && <small>Zbývá {quantity(Math.max(0, item.amount - item.purchased), item.unit)}</small>}{checked && !compact && <small><Check size={12}/>Nakoupeno</small>}</div></div>;
}
function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) { return <label className="search-box"><Search size={17}/><input aria-label={placeholder} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}/>{value && <button aria-label="Vymazat hledání" onClick={() => onChange("")}><X size={14}/></button>}</label>; }
function EmptyRecipes({ onAdd }: { onAdd: () => void }) { return <div className="empty-recipes"><Cookie size={40} strokeWidth={1}/><h3>První dobrota už čeká</h3><p>Vytvořte složku, doplňte suroviny a naplánujte dávky.</p><button className="primary-button" onClick={onAdd}><Plus size={16}/>Přidat první dobrotu</button></div>; }

type DraftRow = { id: string; name: string; amount: string; unit: Unit };
function RecipeEditor({ recipe, isNew, names, onClose, onSave, onDelete }: { recipe: Recipe; isNew: boolean; names: string[]; onClose: () => void; onSave: (r: Recipe) => void; onDelete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState(recipe.name);
  const [art, setArt] = useState(recipe.art);
  const [image, setImage] = useState(recipe.image || "");
  const [imageBusy, setImageBusy] = useState(false);
  const [imageError, setImageError] = useState("");
  const imageInput = useRef<HTMLInputElement>(null);
  const [batches, setBatches] = useState(String(recipe.batches));
  const [notes, setNotes] = useState(recipe.notes);
  const [events, setEvents] = useState(recipe.events || []);
  const [active, setActive] = useState(recipe.active);
  const [rows, setRows] = useState<DraftRow[]>(recipe.ingredients.length ? recipe.ingredients.map(i => ({ ...i, amount: String(i.amount).replace(".", ",") })) : [{ id: uid(), name: "", amount: "", unit: "g" }]);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { dialog.current?.showModal(); }, []);
  async function uploadImage(file: File | undefined) {
    if (!file) return;
    setImageBusy(true); setImageError("");
    try { setImage(await prepareRecipeImage(file)); }
    catch (e) { setImageError(e instanceof Error ? e.message : "Obrázek se nepodařilo nahrát."); }
    finally { setImageBusy(false); if (imageInput.current) imageInput.current.value = ""; }
  }
  function changeRow(id: string, values: Partial<DraftRow>) { setRows(current => current.map(i => i.id === id ? { ...i, ...values } : i)); }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (imageBusy) { setError("Počkejte na dokončení nahrávání obrázku."); return; }
    const number = parseAmount(batches);
    if (!name.trim()) { setError("Pojmenujte svou dobrotu."); return; }
    if (!Number.isFinite(number) || number <= 0 || number > 100) { setError("Počet dávek musí být větší než 0 a nejvýše 100."); return; }
    const filled = rows.filter(i => i.name.trim() || i.amount.trim());
    if (filled.some(i => !i.name.trim() || !i.amount.trim() || !Number.isFinite(parseAmount(i.amount)) || parseAmount(i.amount) <= 0 || parseAmount(i.amount) > 1e7)) { setError("U každé suroviny vyplňte název a kladné množství."); return; }
    if (!validateEvents(events)) { setError("U každého termínu vyplňte název, platné datum a případně čas."); return; }
    onSave({ ...recipe, events: events.map(e => ({ ...e, title: e.title.trim() })), name: name.trim(), art, image, batches: number, active, notes, ingredients: filled.map(i => ({ ...i, name: i.name.trim().replace(/\s+/g, " "), amount: parseAmount(i.amount) })) });
  }
  return <dialog ref={dialog} className="recipe-dialog" aria-labelledby="editor-heading" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><form onSubmit={submit} noValidate><div className={`editor-header ${art}`}><div className="editor-art">{image ? <img src={image} alt="Vlastní obrázek dobroty"/> : <CookieArt kind={art}/>}</div><div><div className="eyebrow">{isNew ? "NOVÁ VÁNOČNÍ DOBROTA" : "VAŠE VÁNOČNÍ KUCHAŘKA"}</div><h2 id="editor-heading">{isNew ? "Co připravíme?" : recipe.name}</h2><p>Suroviny vyplňujte na jednu dávku.</p></div><button type="button" className="dialog-close icon-button" aria-label="Zavřít bez uložení" onClick={onClose}><X size={20}/></button></div><div className="editor-content"><div className="editor-name-row"><label>Název dobroty<input autoFocus={isNew} placeholder="Např. Bramborový salát" value={name} maxLength={100} onChange={e => setName(e.target.value)}/></label><label>Počet dávek<input inputMode="decimal" value={batches} onChange={e => setBatches(e.target.value)}/></label></div><div className="art-picker"><span>Obrázek</span>{illustrations.map(kind => <button type="button" key={kind} className={!image && kind === art ? "chosen" : ""} aria-label={`Vybrat obrázek ${kind === "rolls" ? "rohlíčků" : kind === "linzer" ? "lineckého" : kind === "ginger" ? "perníčku" : kind === "nests" ? "vosích hnízd" : kind === "stars" ? "hvězdiček" : "kokosek"}`} aria-pressed={!image && kind === art} onClick={() => { setArt(kind); setImage(""); setImageError(""); }}><CookieArt kind={kind}/></button>)}</div><RecipeScheduleFields events={events} onChange={setEvents}/><section className="custom-image-section"><div className="custom-image-copy"><h3><ImagePlus size={17}/>Vlastní obrázek</h3><p>Salát, rodinná specialita nebo cukroví podle vás.</p><small>Obrázek se uloží k dobrotě i do zálohy.</small></div>{image && <img className="upload-preview" src={image} alt="Náhled vlastního obrázku"/>}<div className="image-upload-actions"><input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={e => void uploadImage(e.target.files?.[0])}/><button type="button" className="secondary-button upload-image-button" disabled={imageBusy} onClick={() => imageInput.current?.click()}><ImagePlus size={16}/>{imageBusy ? "Nahrávám…" : image ? "Změnit obrázek" : "Nahrát vlastní obrázek"}</button>{image && <button type="button" className="remove-image-button" disabled={imageBusy} onClick={() => { setImage(""); setImageError(""); }}>Odebrat obrázek</button>}<small>JPG, PNG, WebP, GIF, AVIF · do 15 MB</small></div>{imageError && <p className="image-upload-error" role="alert">{imageError}</p>}</section><div className="ingredients-heading"><h3>Suroviny <span>na 1 dávku</span></h3><span><ShoppingBasket size={14}/>Automaticky do nákupu</span></div><datalist id="ingredient-names">{names.map(n => <option key={n} value={n}/>)}</datalist><div className="ingredient-labels"><span>SUROVINA</span><span>MNOŽSTVÍ</span><span>JEDNOTKA</span><span/></div><div className="ingredient-inputs">{rows.map((i, index) => <div className="ingredient-input-row" key={i.id}><input list="ingredient-names" aria-label={`Název suroviny ${index + 1}`} placeholder="Např. Hladká mouka" value={i.name} maxLength={100} onChange={e => changeRow(i.id, { name: e.target.value })}/><input aria-label={`Množství suroviny ${index + 1}`} inputMode="decimal" placeholder="300" value={i.amount} onChange={e => changeRow(i.id, { amount: e.target.value })}/><select aria-label={`Jednotka suroviny ${index + 1}`} value={i.unit} onChange={e => changeRow(i.id, { unit: e.target.value as Unit })}>{units.map(unit => <option value={unit} key={unit}>{unit}</option>)}</select><button type="button" className="icon-button remove-ingredient" aria-label={`Odebrat surovinu ${index + 1}`} onClick={() => setRows(current => current.filter(x => x.id !== i.id))}><X size={17}/></button></div>)}</div><button type="button" className="add-ingredient" disabled={rows.length >= 100} onClick={() => setRows(current => [...current, { id: uid(), name: "", amount: "", unit: "g" }])}><Plus size={16}/>Přidat surovinu</button><p className="ingredient-hint">Stejný název suroviny u více druhů = jeden společný součet.</p><label className="notes-label">Poznámky k přípravě <span>volitelné</span><textarea placeholder="Rodinné tipy, postup nebo odkaz na recept…" value={notes} maxLength={5000} onChange={e => setNotes(e.target.value)} rows={3}/></label><label className="include-checkbox"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)}/><span>Zahrnout dobrotu do nákupního seznamu</span></label>{!!error && <p className="form-error" role="alert"><CircleAlert size={16}/>{error}</p>}{deleting && <div className="delete-confirm" role="alert"><p>Odebrat tuto dobrotu i s jejími surovinami, obrázkem a termíny z plánu?</p><button type="button" onClick={() => setDeleting(false)}>Ponechat</button><button type="button" className="danger" onClick={onDelete}>Odebrat dobrotu</button></div>}</div><div className="editor-footer">{!isNew && <button type="button" className="delete-button" aria-label="Odebrat dobrotu" onClick={() => setDeleting(true)}><Trash2 size={16}/><span>Odebrat</span></button>}<div><button type="button" className="secondary-button" onClick={onClose}>Zrušit</button><button className="primary-button" type="submit" disabled={imageBusy}><Check size={17}/>{isNew ? "Přidat dobrotu" : "Uložit dobrotu"}</button></div></div></form></dialog>;
}
