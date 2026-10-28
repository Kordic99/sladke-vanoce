"use client";

import { useEffect, useRef, useState } from "react";
import { BrushCleaning, Plus, Check, Sparkles, CalendarDays, MapPin, Pencil, Trash2, X, Search, Clock3 } from "lucide-react";
import type { CleaningTask } from "../lib/plan";
import { uid, validateCleaningTasks } from "../lib/plan";
import { cleaningStatus, sortCleaningTasks } from "../lib/cleaning";
import { ChristmasFriends } from "./festive-scene";
import "./cleaning.css";

const rooms = ["Celý domov", "Kuchyně", "Obývák", "Ložnice", "Koupelna", "Předsíň", "Dětský pokoj"];
const ideas = [{ title: "Umýt okna", room: "Celý domov" }, { title: "Utřít prach", room: "Obývák" }, { title: "Vyčistit troubu", room: "Kuchyně" }, { title: "Vytřít podlahu", room: "Celý domov" }];
const dateFormat = new Intl.DateTimeFormat("cs-CZ", { day: "numeric", month: "long" });
function taskDate(task: CleaningTask, today: string) { return task.date ? `${task.date === today ? "Dnes" : dateFormat.format(new Date(`${task.date}T12:00:00Z`))}${task.time ? ` · ${task.time}` : ""}` : "Zatím bez termínu"; }

export function CleaningView({ tasks, today, disabled, onChange, onEditing }: { tasks: CleaningTask[]; today: string; disabled: boolean; onChange: (fn: (current: CleaningTask[]) => CleaningTask[]) => void; onEditing: (value: boolean) => void }) {
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<CleaningTask | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [limitMessage, setLimitMessage] = useState("");
  useEffect(() => { onEditing(!!editor); return () => onEditing(false); }, [editor, onEditing]);
  const pending = tasks.filter(t => !t.done);
  const dueToday = pending.filter(t => t.date === today);
  const overdue = pending.filter(t => t.date && t.date < today);
  const done = tasks.length - pending.length;
  const progress = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  const visible = sortCleaningTasks(tasks).filter(t => (filter === "all" || (filter === "done" ? t.done : filter === "today" ? !t.done && t.date === today : !t.done)) && `${t.title} ${t.room} ${t.notes}`.toLocaleLowerCase("cs").includes(search.toLocaleLowerCase("cs")));
  function open(task?: CleaningTask, idea?: typeof ideas[number]) {
    if (disabled) return;
    if (!task && tasks.length >= 300) { setLimitMessage("V seznamu může být nejvýše 300 úkolů. Některý hotový úkol nejdříve odeberte."); return; }
    setLimitMessage(""); setIsNew(!task);
    setEditor(task ? { ...task } : { id: uid(), title: idea?.title || "", room: idea?.room || "", date: "", time: "", notes: "", done: false });
  }
  return <div className="cleaning-page">
    <section className="cleaning-hero"><div className="cleaning-hero-copy"><div className="eyebrow"><Sparkles size={13}/>VÁNOČNÍ ÚKLIDOVÁ ČETA</div><h1>Ať to doma <em>zazáří.</em></h1><p>Prach má padla. My máme plán.<br/>Co, kde a kdy uklidit — pěkně na jednom místě.</p><button className="primary-button" disabled={disabled} onClick={() => open()}><Plus size={17}/>Přidat úkol</button></div><ChristmasFriends cleaning/><span className="cleaning-hero-stamp">MAX RUČÍ ZA ČISTÉ TLAPKY</span></section>
    <section className="cleaning-stats" aria-label="Přehled úklidu"><div><span><BrushCleaning size={18}/>Zbývá uklidit</span><strong>{pending.length}</strong><small>úkolů před námi</small></div><div><span><CalendarDays size={18}/>Na dnešek</span><strong>{dueToday.length}</strong><small>{overdue.length ? `A ${overdue.length} po termínu` : "Hezky krok za krokem"}</small></div><div><span><Check size={18}/>Už se blýská</span><strong>{done}<small> / {tasks.length}</small></strong><div className="cleaning-progress" aria-label={`Hotovo ${progress} procent`}><i style={{ width: `${progress}%` }}/></div></div></section>
    <div className="cleaning-layout"><section className="panel cleaning-list-panel"><div className="cleaning-list-heading"><div><h2>Náš úklidový plán</h2><p>Nejdřív to nejbližší. Pak nohy nahoru.</p></div><BrushCleaning size={23}/></div><div className="cleaning-toolbar"><div className="cleaning-filters" role="group" aria-label="Filtrovat úklid">{[{ key: "pending", label: "K úklidu", count: pending.length }, { key: "today", label: "Dnes", count: dueToday.length }, { key: "done", label: "Hotovo", count: done }, { key: "all", label: "Vše", count: tasks.length }].map(f => <button key={f.key} aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}<span>{f.count}</span></button>)}</div><label className="cleaning-search"><Search size={16}/><input aria-label="Hledat v úklidu" placeholder="Najít úkol nebo místnost…" value={search} onChange={e => setSearch(e.target.value)}/></label></div>
    {limitMessage && <p role="alert" className="cleaning-limit">{limitMessage}</p>}
    <div className="cleaning-rows">{visible.map(task => { const state = cleaningStatus(task, today); return <article className={`cleaning-row ${state}`} key={task.id}><label className="cleaning-checkbox"><input type="checkbox" checked={task.done} disabled={disabled} aria-label={`Označit ${task.title} jako ${task.done ? "nehotové" : "hotové"}`} onChange={() => onChange(current => current.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}/><span aria-hidden="true"><Check size={15}/></span></label><div className="cleaning-task-copy"><h3>{task.title}</h3><div className="cleaning-task-meta">{task.room && <span><MapPin size={12}/>{task.room}</span>}<span className="cleaning-task-date"><CalendarDays size={12}/>{taskDate(task, today)}{state === "overdue" && <b>Po termínu</b>}</span></div>{task.notes && <p>{task.notes}</p>}</div><button className="cleaning-edit" disabled={disabled} aria-label={`Upravit úkol ${task.title}`} onClick={() => open(task)}><Pencil size={16}/></button></article>; })}</div>
    {!visible.length && <div className="cleaning-empty"><span><BrushCleaning size={31}/></span><h3>{tasks.length === 0 ? "Začneme jedním malým úkolem." : search ? "Tady prach nenajdeme." : filter === "today" ? "Na dnešek je tu čisto." : filter === "done" ? "První odškrtnutí teprve přijde." : "Hotovo. Čas na cukroví!"}</h3><p>{tasks.length === 0 ? "Přidejte, co chcete uklidit, a vyberte si termín. Max už přinesl kyblík." : search ? "Zkuste jiný název nebo místnost." : filter === "today" ? "Další úkoly najdete v přehledu K úklidu." : filter === "done" ? "Splněný úkol stačí odškrtnout." : "Dopřejte si zaslouženou vánoční pohodu."}</p>{tasks.length === 0 && <button className="secondary-button" disabled={disabled} onClick={() => open()}><Plus size={16}/>Přidat první úkol</button>}</div>}
    <div className="cleaning-list-footer"><CloudNote/>Úkoly se ukládají společně s vaším vánočním plánem.</div></section>
    <aside className="cleaning-aside"><div className="cleaning-ideas"><span className="eyebrow">MALÁ INSPIRACE</span><h2>Kde začneme?</h2><p>Vyberte úkol, doplňte termín a upravte si ho podle sebe.</p>{ideas.map(idea => <button disabled={disabled} key={idea.title} onClick={() => open(undefined, idea)}><span>{idea.title}<small>{idea.room}</small></span><Plus size={17}/></button>)}</div><div className="cleaning-tip"><Sparkles size={20}/><p>„Ukrást Vánoce? Letos radši setřu prach.“</p><small>Grinch, vedoucí úklidové čety</small></div></aside></div>
    {editor && <CleaningEditor key={editor.id} task={editor} isNew={isNew} disabled={disabled} onClose={() => setEditor(null)} onSave={task => { onChange(current => isNew ? [...current, task] : current.map(t => t.id === task.id ? task : t)); setEditor(null); }} onDelete={() => { const id = editor.id; onChange(current => current.filter(t => t.id !== id)); setEditor(null); }}/>}
  </div>;
}

function CloudNote() { return <Check size={13}/>; }

function CleaningEditor({ task, isNew, disabled, onClose, onSave, onDelete }: { task: CleaningTask; isNew: boolean; disabled: boolean; onClose: () => void; onSave: (task: CleaningTask) => void; onDelete: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState(task);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  useEffect(() => { dialog.current?.showModal(); }, []);
  function change(values: Partial<CleaningTask>) { setDraft(current => ({ ...current, ...values })); }
  return <dialog ref={dialog} className="cleaning-dialog" aria-labelledby="cleaning-editor-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><form onSubmit={e => { e.preventDefault(); if (disabled) return; const value = { ...draft, title: draft.title.trim(), room: draft.room.trim(), notes: draft.notes.trim() }; if (!validateCleaningTasks([value])) { setError("Vyplňte název úkolu a zkontrolujte datum a čas."); return; } onSave(value); }}><header><span><BrushCleaning size={23}/></span><div><div className="eyebrow">NAŠE ÚKLIDOVÁ ČETA</div><h2 id="cleaning-editor-title">{isNew ? "Co dáme do pořádku?" : "Upravit úkol"}</h2></div><button type="button" className="icon-button" aria-label="Zavřít úklidový úkol" onClick={onClose}><X size={21}/></button></header><div className="cleaning-form-body"><label>Co uklidíme?<input autoFocus required maxLength={120} placeholder="Např. Utřít prach na poličkách" value={draft.title} onChange={e => change({ title: e.target.value })}/></label><label>Kde? <small>volitelné</small><input list="cleaning-rooms" maxLength={60} placeholder="Např. Obývák" value={draft.room} onChange={e => change({ room: e.target.value })}/><datalist id="cleaning-rooms">{rooms.map(room => <option key={room} value={room}/>)}</datalist></label><div className="cleaning-date-fields"><label><span><CalendarDays size={15}/>Datum <small>volitelné</small></span><input type="date" min="1000-01-01" max="9999-12-31" value={draft.date} onChange={e => change({ date: e.target.value, ...(!e.target.value ? { time: "" } : {}) })}/></label><label><span><Clock3 size={15}/>Čas <small>volitelné</small></span><input type="time" disabled={!draft.date} value={draft.time} onChange={e => change({ time: e.target.value })}/></label></div><label>Poznámka <small>volitelné</small><textarea rows={3} maxLength={1500} placeholder="Co připravit, na co nezapomenout…" value={draft.notes} onChange={e => change({ notes: e.target.value })}/></label>{error && <p className="form-error" role="alert">{error}</p>}{disabled && <p className="form-error" role="alert">Seznam se změnil na druhém zařízení. Zavřete úkol a načtěte aktuální verzi.</p>}{deleting && <div className="cleaning-delete-confirm" role="alert"><p>Opravdu odebrat tento úklidový úkol?</p><button type="button" onClick={() => setDeleting(false)}>Ponechat</button><button type="button" disabled={disabled} onClick={onDelete}>Odebrat úkol</button></div>}</div><footer>{!isNew && <button type="button" className="cleaning-delete" disabled={disabled} aria-label="Odebrat úklidový úkol" onClick={() => setDeleting(true)}><Trash2 size={18}/></button>}<button type="button" className="secondary-button" onClick={onClose}>Zrušit</button><button type="submit" className="primary-button" disabled={disabled}><Check size={16}/>{isNew ? "Přidat úkol" : "Uložit změny"}</button></footer></form></dialog>;
}
