import { useCallback, useEffect, useMemo, useState } from "react";
import type { ItineraryBoard, ItineraryDay, ItineraryItem } from "../../../shared/types";
import { registerWebMcpTools } from "../webmcp";

type ToolDefinition = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (input: Record<string, unknown>, options?: { signal: AbortSignal }) => Promise<unknown>;
};

declare global {
  interface Document {
    modelContext?: {
      registerTool: (tool: ToolDefinition) => Promise<undefined>;
      getTools: () => Promise<unknown[]>;
    };
  }
}

const categoryLabels: Record<ItineraryItem["category"], string> = { stay: "Stay", food: "Food", culture: "Culture", transit: "Transit", nature: "Nature" };
const emptyItem = { time: "09:00", title: "", location: "", category: "culture" as ItineraryItem["category"], notes: "" };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { headers: { "Content-Type": "application/json" }, ...init });
  if (!response.ok) throw new Error((await response.json()).error ?? "Request failed");
  return response.status === 204 ? (undefined as T) : response.json();
}

export default function Home() {
  const [board, setBoard] = useState<ItineraryBoard | null>(null);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [toolStatus, setToolStatus] = useState("Checking tool surface");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState(emptyItem);
  const [newDrafts, setNewDrafts] = useState<Record<string, typeof emptyItem>>({});
  const [newDayOpen, setNewDayOpen] = useState(false);
  const [dayDraft, setDayDraft] = useState({ date: "2026-10-15", label: "" });

  const refresh = useCallback(async () => {
    try { setBoard(await api<ItineraryBoard>("/api/itinerary")); setLastRefresh(new Date()); setError(""); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not load itinerary."); }
  }, []);

  useEffect(() => { void refresh(); const timer = window.setInterval(() => void refresh(), 3500); return () => window.clearInterval(timer); }, [refresh]);

  const registerTools = useCallback(async () => {
    if (!document.modelContext) { setToolStatus("Browser tool API unavailable"); return; }
    try { const count = await registerWebMcpTools(document.modelContext, api, refresh); setToolStatus(`${count} tools registered`); }
    catch { setToolStatus("Tool registration needs a fresh page"); }
  }, [refresh]);

  useEffect(() => { void registerTools(); }, [registerTools]);

  const itemCount = useMemo(() => board?.days.reduce((total, day) => total + day.items.length, 0) ?? 0, [board]);
  const saveItem = async (dayId: string) => {
    if (!editingItem) return;
    try { await api(`/api/itinerary/items/${editingItem}`, { method: "PATCH", body: JSON.stringify({ ...editDraft, dayId, source: "human" }) }); setEditingItem(null); setEditDraft(emptyItem); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not save item."); }
  };
  const addItem = async (dayId: string) => {
    try { await api("/api/itinerary/items", { method: "POST", body: JSON.stringify({ ...(newDrafts[dayId] ?? emptyItem), dayId, source: "human" }) }); setNewDrafts((current) => ({ ...current, [dayId]: emptyItem })); await refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : "Could not add item."); }
  };
  const removeItem = async (id: string) => { if (!window.confirm("Remove this item from the shared board?")) return; try { await api(`/api/itinerary/items/${id}`, { method: "DELETE", body: JSON.stringify({ source: "human" }) }); await refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Could not remove item."); } };
  const addDay = async () => { try { await api("/api/itinerary/days", { method: "POST", body: JSON.stringify({ ...dayDraft, source: "human" }) }); setDayDraft({ date: "2026-10-15", label: "" }); setNewDayOpen(false); await refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Could not add day."); } };
  const removeDay = async (id: string) => { if (!window.confirm("Remove this day and its items?")) return; try { await api(`/api/itinerary/days/${id}`, { method: "DELETE", body: JSON.stringify({ source: "human" }) }); await refresh(); } catch (err) { setError(err instanceof Error ? err.message : "Could not remove day."); } };
  const startEdit = (item: ItineraryItem) => { setEditingItem(item.id); setEditDraft({ time: item.time, title: item.title, location: item.location, category: item.category, notes: item.notes }); };

  if (!board) return <main className="loading"><span className="eyebrow">COPLAN / SHARED BOARD</span><h1>Making room<br />for the next idea.</h1><p>{error || "Loading the live itinerary…"}</p></main>;

  return <div className="app-shell">
    <header className="topbar"><a className="wordmark" href="/">Co<span>/</span>Plan</a><div className="topbar-meta"><span className="live-dot" /> <span>Live shared board</span><span className="slash">/</span><span>Last synced {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span></div><div className="tool-pill"><span className="tool-mark">⌘</span>{toolStatus}</div></header>
    <main className="container">
      <section className="hero"><div className="hero-kicker"><span>01</span><span>TRIP STUDY / AUTUMN 2026</span></div><h1>Make a week<br /><em>of it.</em></h1><div className="hero-side"><p>Kyoto, slowly. A working itinerary for curious people who prefer the long way around.</p><div className="hero-rule" /><span>Human taste +<br />agent precision</span></div></section>
      <section className="board-intro"><div><span className="eyebrow">{board.destination}</span><h2>{board.title}</h2></div><div className="board-actions"><span className="item-count">{itemCount} stops / {board.days.length} days</span><button className="button dark" onClick={() => setNewDayOpen((open) => !open)}>+ Add day</button></div></section>
      {newDayOpen && <div className="day-form inline-form"><input type="date" value={dayDraft.date} onChange={(event) => setDayDraft({ ...dayDraft, date: event.target.value })} /><input placeholder="Day title" value={dayDraft.label} onChange={(event) => setDayDraft({ ...dayDraft, label: event.target.value })} /><button className="button dark" onClick={() => void addDay()}>Create day</button><button className="text-button" onClick={() => setNewDayOpen(false)}>Cancel</button></div>}
      {error && <div className="error-banner">{error}<button onClick={() => setError("")}>Dismiss</button></div>}
      <section className="days">{board.days.map((day, index) => <DayColumn key={day.id} day={day} index={index} editingItem={editingItem} editDraft={editDraft} setEditDraft={setEditDraft} newDraft={newDrafts[day.id] ?? emptyItem} setNewDraft={(draft) => setNewDrafts((current) => ({ ...current, [day.id]: draft }))} startEdit={startEdit} saveItem={saveItem} addItem={addItem} removeItem={removeItem} removeDay={removeDay} cancelEdit={() => { setEditingItem(null); setEditDraft(emptyItem); }} />)}</section>
      <section className="webmcp-note"><div className="note-number">02</div><div><span className="eyebrow">WHY THIS IS DIFFERENT</span><h2>One board.<br /><em>Two kinds of agency.</em></h2></div><p>WebMCP gives an agent structured tools on this page instead of a screenshot to interpret. Every tool call reaches the same live server routes as the human controls, so an agent can read, add, refine, or remove a stop while the board keeps its visual truth. You stay in the loop; the itinerary stays real.</p></section>
    </main><footer><span>CoPlan / A WebMCP challenge study</span><span>State is in memory and shared by this running board</span></footer>
  </div>;
}

function DayColumn({ day, index, editingItem, editDraft, setEditDraft, newDraft, setNewDraft, startEdit, saveItem, addItem, removeItem, removeDay, cancelEdit }: { day: ItineraryDay; index: number; editingItem: string | null; editDraft: typeof emptyItem; setEditDraft: (draft: typeof emptyItem) => void; newDraft: typeof emptyItem; setNewDraft: (draft: typeof emptyItem) => void; startEdit: (item: ItineraryItem) => void; saveItem: (dayId: string) => Promise<void>; addItem: (dayId: string) => Promise<void>; removeItem: (id: string) => Promise<void>; removeDay: (id: string) => Promise<void>; cancelEdit: () => void }) {
  return <article className="day-column"><div className="day-heading"><div><span className="day-index">DAY {String(index + 1).padStart(2, "0")}</span><h3>{day.label}</h3><time>{new Date(`${day.date}T12:00:00`).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" })}</time></div><button className="icon-button" aria-label={`Delete ${day.label}`} onClick={() => void removeDay(day.id)}>×</button></div><div className="day-rule" />
    <div className="items">{day.items.map((item) => editingItem === item.id ? <ItemEditor key={item.id} draft={editDraft} setDraft={setEditDraft} onSave={() => void saveItem(day.id)} onCancel={cancelEdit} /> : <div className="item-card" key={item.id}><div className="item-time">{item.time}</div><div className="item-body"><div className="item-title-row"><h4>{item.title}</h4>{item.source === "agent" && <span className="agent-tag">AGENT</span>}</div><p className="location">{item.location} <span>·</span> {categoryLabels[item.category]}</p>{item.notes && <p className="notes">{item.notes}</p>}<div className="item-actions"><button onClick={() => startEdit(item)}>Edit</button><button onClick={() => void removeItem(item.id)}>Remove</button></div></div></div>)}<ItemEditor draft={newDraft} setDraft={setNewDraft} onSave={() => void addItem(day.id)} onCancel={cancelEdit} isNew /></div>
  </article>;
}

function ItemEditor({ draft, setDraft, onSave, onCancel, isNew = false }: { draft: typeof emptyItem; setDraft: (draft: typeof emptyItem) => void; onSave: () => void; onCancel: () => void; isNew?: boolean }) {
  return <div className={`item-editor ${isNew ? "new-item" : ""}`}><div className="editor-label">{isNew ? "+ Add a stop" : "Edit stop"}</div><div className="editor-grid"><input aria-label="Time" type="time" value={draft.time} onChange={(e) => setDraft({ ...draft, time: e.target.value })} /><input aria-label="Activity" placeholder="Activity" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /><input aria-label="Location" placeholder="Location" value={draft.location} onChange={(e) => setDraft({ ...draft, location: e.target.value })} /><select aria-label="Category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as ItineraryItem["category"] })}>{Object.entries(categoryLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></div><textarea aria-label="Notes" placeholder="A note for the board (optional)" value={draft.notes} onChange={(e) => setDraft({ ...draft, notes: e.target.value })} /><div className="editor-actions"><button className="button dark small" onClick={onSave}>{isNew ? "Add to day" : "Save changes"}</button>{!isNew && <button className="text-button" onClick={onCancel}>Cancel</button>}</div></div>;
}
