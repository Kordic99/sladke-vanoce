"use client";

import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, X, Check, Clock3, BellRing, ArrowUpRight, Trash2 } from "lucide-react";
import { eventKinds, uid, validateEvents } from "../lib/plan";
import type { CalendarEvent, EventKind, Plan } from "../lib/plan";
import { calendarEntries, upcomingEntries, pragueToday, kindLabels, formatDate, monthCells, shiftMonth, reminderKey } from "../lib/calendar";
import type { CalendarEntry } from "../lib/calendar";

export function useToday() {
  const [today, setToday] = useState(pragueToday);
  useEffect(() => {
    const refresh = () => setToday(pragueToday());
    const timer = setInterval(refresh, 60000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => { clearInterval(timer); window.removeEventListener("focus", refresh); document.removeEventListener("visibilitychange", refresh); };
  }, []);
  return today;
}

export function RecipeScheduleFields({ events, onChange }: { events: CalendarEvent[]; onChange: (events: CalendarEvent[]) => void }) {
  function change(id: string, values: Partial<CalendarEvent>) { onChange(events.map(e => e.id === id ? { ...e, ...values } : e)); }
  return <section className="recipe-schedule" aria-labelledby="recipe-schedule-title">
    <div className="schedule-heading"><div><h3 id="recipe-schedule-title"><CalendarDays size={19}/>Kdy se do toho pustíme?</h3><p>Těsto, pečení i zdobení mohou mít každý svůj termín.</p></div><span>{events.length} / 100</span></div>
    <div className="schedule-drafts">{events.map((e, i) => <div className={`schedule-draft ${e.done ? "done" : ""}`} key={e.id}>
      <div className="schedule-draft-top"><label>Druh přípravy<select value={e.kind} aria-label={`Druh přípravy ${i + 1}`} onChange={ev => { const kind = ev.target.value as EventKind; change(e.id, { kind, title: !e.title.trim() || e.title === kindLabels[e.kind] ? kindLabels[kind] : e.title }); }}>{eventKinds.map(k => <option key={k} value={k}>{kindLabels[k]}</option>)}</select></label><label>Co je potřeba udělat<input value={e.title} maxLength={120} aria-label={`Název události ${i + 1}`} onChange={ev => change(e.id, { title: ev.target.value })}/></label><button type="button" className="icon-button" aria-label={`Odebrat termín ${i + 1}`} onClick={() => onChange(events.filter(x => x.id !== e.id))}><X size={17}/></button></div>
      <div className="schedule-draft-bottom"><label>Datum<input type="date" min="1000-01-01" max="9999-12-31" aria-label={`Datum události ${i + 1}`} value={e.date} onInput={ev => change(e.id, { date: ev.currentTarget.value })} onChange={ev => change(e.id, { date: ev.target.value })}/></label><label>Čas <small>volitelné</small><input type="time" aria-label={`Čas události ${i + 1}`} value={e.time || ""} onInput={ev => change(e.id, { time: ev.currentTarget.value })} onChange={ev => change(e.id, { time: ev.target.value })}/></label><label className="schedule-done"><input type="checkbox" checked={e.done} onChange={ev => change(e.id, { done: ev.target.checked })}/>Hotovo</label></div>
    </div>)}</div>
    <button type="button" className="secondary-button" disabled={events.length >= 100} onClick={() => onChange([...events, { id: uid(), title: kindLabels.dough, kind: "dough", date: pragueToday(), done: false }])}><Plus size={15}/>Přidat termín</button>
    <p className="schedule-hint">Termíny se uloží spolu s dobrotou. Týden předem je uvidíte na přehledu.</p>
  </section>;
}

function EventRow({ entry: e, onEdit, onToggle, withDate = false }: { entry: CalendarEntry; onEdit: (e: CalendarEntry) => void; onToggle: (e: CalendarEntry) => void; withDate?: boolean }) {
  return <div className={`calendar-event-row ${e.done ? "done" : ""}`}>
    <label className="event-check"><input type="checkbox" checked={e.done} onChange={() => onToggle(e)} aria-label={`${e.title} – ${e.recipeName} hotovo`}/></label>
    {withDate && <span className="event-date"><b>{formatDate(e.date, { day: "numeric" })}</b><small>{formatDate(e.date, { month: "short" })}</small></span>}
    <button className="event-details" onClick={() => onEdit(e)}><strong>{e.title}</strong><span>{e.recipeName}</span><small><i className={`kind-dot ${e.kind}`}/>{kindLabels[e.kind]}{e.time && <> · <Clock3 size={11}/>{e.time}</>}</small></button>
    <button className="icon-button event-edit" aria-label={`Upravit ${e.title} – ${e.recipeName}`} onClick={() => onEdit(e)}><ArrowUpRight size={17}/></button>
  </div>;
}

type CalendarActions = { onEdit: (e: CalendarEntry) => void; onToggle: (e: CalendarEntry) => void; onAdd: (date: string) => void };
export function UpcomingPanel({ plan, today, onCalendar, onEdit, onToggle, onAdd }: CalendarActions & { plan: Plan; today: string; onCalendar: () => void }) {
  const events = upcomingEntries(plan, today);
  return <section className="upcoming-panel panel" aria-labelledby="upcoming-heading"><div className="panel-heading"><div className="heading-with-icon"><CalendarDays size={22}/><div><h2 id="upcoming-heading">Co nás čeká</h2><p>Dnes a příštích 7 dní</p></div></div><button className="text-link" onClick={onCalendar}>Kalendář <ArrowUpRight size={16}/></button></div>
    {events.length ? <div className="upcoming-events">{events.slice(0, 6).map(e => <div className={e.date === today ? "upcoming-today" : ""} key={`${e.recipeId}/${e.id}`}><EventRow entry={e} onEdit={onEdit} onToggle={onToggle} withDate/>{e.date === today && <span className="today-ribbon">DNES</span>}</div>)}</div> : <div className="upcoming-empty"><span className="calendar-empty-icon"><CalendarDays size={27}/></span><div><h3>Na dobré věci je čas.</h3><p>V příštím týdnu nemáte žádný nesplněný úkol.<br/>Naplánujte si přípravu u své oblíbené dobroty.</p></div><button className="secondary-button" onClick={() => onAdd(today)}><Plus size={15}/>Přidat termín</button></div>}
    {events.length > 0 && <div className="upcoming-footer"><span>{events.length} {events.length === 1 ? "naplánovaný úkol" : events.length < 5 ? "naplánované úkoly" : "naplánovaných úkolů"}{events.length > 6 ? " · zobrazeno prvních 6" : ""}</span><button className="text-link" onClick={() => onAdd(today)}><Plus size={14}/>Přidat termín</button></div>}
  </section>;
}

export function CalendarView({ plan, today, onEdit, onToggle, onAdd }: CalendarActions & { plan: Plan; today: string }) {
  const [month, setMonth] = useState(today.slice(0, 7) + "-01");
  const [selected, setSelected] = useState(today);
  const [showDone, setShowDone] = useState(true);
  const entries = calendarEntries(plan).filter(e => showDone || !e.done);
  const dayEntries = entries.filter(e => e.date === selected);
  function selectDay(date: string) { setSelected(date); if (date.slice(0, 7) !== month.slice(0, 7)) setMonth(date.slice(0, 7) + "-01"); }
  return <>
    <div className="page-heading"><div className="eyebrow">NA VŠECHNO JE TEN SPRÁVNÝ ČAS</div><div className="title-row"><div><h1>Vánoční <em>kalendář.</em></h1><p>Od prvního těsta až po poslední ozdobený perníček.</p></div><button className="primary-button" onClick={() => onAdd(selected)}><Plus size={17}/>Přidat termín</button></div></div>
    <div className="calendar-layout"><section className="month-panel panel" aria-label="Měsíční kalendář"><div className="month-toolbar"><h2>{formatDate(month, { month: "long", year: "numeric" })}</h2><div><button className="calendar-today-button" onClick={() => { setMonth(today.slice(0, 7) + "-01"); setSelected(today); }}>Dnes</button><button className="icon-button" aria-label="Předchozí měsíc" disabled={month <= "1000-01-01"} onClick={() => setMonth(shiftMonth(month, -1))}><ChevronLeft size={20}/></button><button className="icon-button" aria-label="Následující měsíc" disabled={month >= "9999-12-01"} onClick={() => setMonth(shiftMonth(month, 1))}><ChevronRight size={20}/></button></div></div>
      <div className="weekdays" aria-hidden="true">{["Po", "Út", "St", "Čt", "Pá", "So", "Ne"].map(d => <span key={d}>{d}</span>)}</div>
      <div className="month-grid">{monthCells(month).map(date => { const events = entries.filter(e => e.date === date); return <button key={date} className={`calendar-day ${date.slice(0, 7) !== month.slice(0, 7) ? "outside" : ""} ${date === today ? "today" : ""} ${date === selected ? "selected" : ""}`} aria-pressed={date === selected} aria-label={`${formatDate(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, události: ${events.length}`} onClick={() => selectDay(date)}><span className="day-number">{Number(date.slice(-2))}</span><div className="day-events">{events.slice(0, 2).map(e => <span key={`${e.recipeId}/${e.id}`} className={`day-event ${e.kind} ${e.done ? "done" : ""}`}>{e.time ? e.time + " " : ""}{e.title}</span>)}{events.length > 2 && <small>+{events.length - 2} další</small>}</div>{events.length > 0 && <span className="mobile-event-count">{events.length}</span>}</button>; })}</div>
      <div className="calendar-legend"><label><input type="checkbox" checked={showDone} onChange={e => setShowDone(e.target.checked)}/>Zobrazit i hotové úkoly</label><span><i className="kind-dot dough"/>Těsto <i className="kind-dot bake"/>Pečení <i className="kind-dot decorate"/>Zdobení</span></div>
    </section><aside className="day-panel panel"><div className="day-panel-heading"><span>{selected === today ? "DNES V KUCHYNI" : formatDate(selected, { weekday: "long" }).toLocaleUpperCase("cs")}</span><h2>{formatDate(selected, { day: "numeric", month: "long" })}</h2><p>{formatDate(selected, { year: "numeric" })}</p></div><div className="day-list">{dayEntries.length ? dayEntries.map(e => <EventRow key={`${e.recipeId}/${e.id}`} entry={e} onEdit={onEdit} onToggle={onToggle}/>) : <div className="day-empty"><CalendarDays size={30}/><h3>Volno pro vánoční pohodu.</h3><p>Na tento den zatím nic neplánujete.</p></div>}</div><button className="secondary-button day-add" onClick={() => onAdd(selected)}><Plus size={16}/>Přidat na tento den</button></aside></div>
    <p className="calendar-notice"><BellRing size={17}/>V den události se při otevření dashboardu zobrazí připomenutí. Čas je orientační; upozornění platí pro celý den. Termíny se řídí časem v Česku.</p>
  </>;
}

export type EventEditorState = { recipeId: string; date: string; entry?: CalendarEntry };
export function EventDialog({ plan, state, onClose, onSave, onDelete }: { plan: Plan; state: EventEditorState; onClose: () => void; onSave: (recipeId: string, event: CalendarEvent) => void; onDelete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [recipeId, setRecipeId] = useState(state.recipeId);
  const [draft, setDraft] = useState<CalendarEvent>(() => state.entry ? { id: state.entry.id, title: state.entry.title, date: state.entry.date, time: state.entry.time, kind: state.entry.kind, done: state.entry.done } : { id: uid(), title: kindLabels.dough, date: state.date, kind: "dough", done: false });
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { dialog.current?.showModal(); }, []);
  function submit(e: React.FormEvent) {
    e.preventDefault();
    const event = { ...draft, title: draft.title.trim() };
    if (!validateEvents([event])) { setError("Vyplňte název, platné datum a případně čas ve formátu HH:MM."); return; }
    const recipe = plan.recipes.find(r => r.id === recipeId);
    if (!recipe) { setError("Vyberte dobrotu, ke které termín patří."); return; }
    if ((recipe.events || []).filter(e => !(state.entry?.recipeId === recipeId && e.id === event.id)).length >= 100) { setError("Jedna dobrota může mít nejvýše 100 termínů."); return; }
    onSave(recipeId, event);
  }
  return <dialog ref={dialog} className="event-dialog" aria-labelledby="event-dialog-title" onCancel={onClose}><form onSubmit={submit} noValidate><div className="event-dialog-header"><span><CalendarDays size={25}/></span><div><div className="eyebrow">CHVILKA PRO NAŠE DOBROTY</div><h2 id="event-dialog-title">{state.entry ? "Upravit termín" : "Nový termín"}</h2></div><button type="button" className="icon-button" aria-label="Zavřít termín bez uložení" onClick={onClose}><X size={20}/></button></div><div className="event-form-fields">
    <label>Dobrota<select value={recipeId} onChange={e => setRecipeId(e.target.value)}>{plan.recipes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
    <label>Druh přípravy<select value={draft.kind} onChange={e => { const kind = e.target.value as EventKind; setDraft(d => ({ ...d, kind, title: !d.title.trim() || d.title === kindLabels[d.kind] ? kindLabels[kind] : d.title })); }}>{eventKinds.map(k => <option key={k} value={k}>{kindLabels[k]}</option>)}</select></label>
    <label>Název události<input autoFocus value={draft.title} maxLength={120} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}/></label>
    <div className="event-datetime"><label>Datum<input type="date" min="1000-01-01" max="9999-12-31" value={draft.date} onInput={e => { const value = e.currentTarget.value; setDraft(d => ({ ...d, date: value })); }} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))}/></label><label>Čas <small>volitelné</small><input type="time" value={draft.time || ""} onInput={e => { const value = e.currentTarget.value; setDraft(d => ({ ...d, time: value })); }} onChange={e => setDraft(d => ({ ...d, time: e.target.value }))}/></label></div>
    <label className="schedule-done"><input type="checkbox" checked={draft.done} onChange={e => setDraft(d => ({ ...d, done: e.target.checked }))}/>Úkol je hotový</label><p className="schedule-hint">Týden předem se objeví na přehledu. V den události vás přivítá připomenutí.</p>
    {error && <p className="form-error" role="alert">{error}</p>}{deleting && <div className="delete-confirm"><p>Odebrat tento termín z kalendáře?</p><button type="button" onClick={() => setDeleting(false)}>Ponechat</button><button type="button" className="danger" onClick={onDelete}>Odebrat termín</button></div>}
    </div><div className="editor-footer">{state.entry && <button type="button" className="delete-button" aria-label="Odebrat termín" onClick={() => setDeleting(true)}><Trash2 size={17}/></button>}<div><button type="button" className="secondary-button" onClick={onClose}>Zrušit</button><button type="submit" className="primary-button"><Check size={16}/>Uložit termín</button></div></div></form></dialog>;
}

export function DailyReminder({ today, entries, paused, manual, onManualClose, onCalendar, onToggle }: { today: string; entries: CalendarEntry[]; paused: boolean; manual: boolean; onManualClose: () => void; onCalendar: () => void; onToggle: (e: CalendarEntry) => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [seen, setSeen] = useState<string[] | null>(null);
  const todays = entries.filter(e => e.date === today && !e.done);
  useEffect(() => {
    try { const saved = JSON.parse(localStorage.getItem("sladke-vanoce-reminders-seen") || "null"); setSeen(saved?.date === today && Array.isArray(saved.keys) ? saved.keys.filter((k: unknown) => typeof k === "string") : []); }
    catch { setSeen([]); }
  }, [today]);
  const show = !paused && seen !== null && (manual || todays.some(e => !seen.includes(reminderKey(e))));
  useEffect(() => { if (show && !dialog.current?.open) dialog.current?.showModal(); else if (!show && dialog.current?.open) dialog.current.close(); }, [show]);
  function dismiss() {
    const keys = [...new Set([...(seen || []), ...todays.map(reminderKey)])];
    setSeen(keys); onManualClose();
    try { localStorage.setItem("sladke-vanoce-reminders-seen", JSON.stringify({ date: today, keys })); } catch {}
  }
  return <dialog ref={dialog} className="daily-reminder" aria-labelledby="daily-reminder-title" onCancel={e => { e.preventDefault(); dismiss(); }}><div className="reminder-top"><span className="reminder-bell"><BellRing size={28}/></span><button className="icon-button" aria-label="Zavřít dnešní připomenutí" onClick={dismiss}><X size={21}/></button><div className="eyebrow">{formatDate(today, { weekday: "long", day: "numeric", month: "long" })}</div><h2 id="daily-reminder-title">{todays.length ? "Dnes to u nás zavoní." : "Dnes máme volno."}</h2><p>{todays.length ? "Na dnešek máte naplánováno:" : "Všechny dnešní úkoly jsou hotové nebo tu ještě žádné nejsou."}</p></div><div className="reminder-events">{todays.map(e => <label key={`${e.recipeId}/${e.id}`}><input type="checkbox" checked={false} aria-label={`${e.title} – ${e.recipeName} hotovo v připomenutí`} onChange={() => onToggle(e)}/><span><strong>{e.title}</strong><small>{e.recipeName}{e.time && ` · ${e.time}`}</small></span></label>)}</div><div className="reminder-actions"><button className="secondary-button" onClick={() => { dismiss(); onCalendar(); }}>Otevřít kalendář</button><button className="primary-button" onClick={dismiss}><Check size={16}/>Rozumím</button></div></dialog>;
}
