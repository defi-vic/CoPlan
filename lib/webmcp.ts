import type { Board } from "./types";

export type WebMcpTool = { name: string; title?: string; description: string; inputSchema?: Record<string, unknown>; execute: (input: Record<string, unknown>, options?: { signal: AbortSignal }) => Promise<unknown> };
export type WebMcpContext = { registerTool: (tool: WebMcpTool) => Promise<unknown> | unknown; unregisterTool?: (name: string) => Promise<unknown> | unknown };
export type ToolRequest = (path: string, init?: RequestInit) => Promise<unknown>;
const text = (message: string) => ({ content: [{ type: "text", text: message }] });

export async function registerWebMcpTools(context: WebMcpContext | undefined, request: ToolRequest, refresh: () => Promise<void>, signal: AbortSignal) {
  if (!context || signal.aborted) return () => undefined;
  const tools: WebMcpTool[] = [
    { name: "get_trip_board", title: "Get trip board", description: "Read the current shared trip board.", inputSchema: { type: "object", properties: {} }, execute: async () => { const board = await request("/api/board") as Board; return text(`${board.destination} · ${board.dates}. ${board.activities.length} activities, $${board.spent} spent of $${board.budget}.`); } },
    { name: "set_trip_details", title: "Set trip details", description: "Update destination, dates, or budget for the shared trip.", inputSchema: { type: "object", properties: { destination: { type: "string" }, dates: { type: "string" }, budget: { type: "number" } } }, execute: async (input) => { await request("/api/board", { method: "PATCH", body: JSON.stringify(input) }); await refresh(); return text("Trip details updated on the shared board."); } },
    { name: "add_activity", title: "Add activity", description: "Add an activity to the shared trip.", inputSchema: { type: "object", properties: { title: { type: "string" }, cost: { type: "number" }, notes: { type: "string" } }, required: ["title"] }, execute: async (input) => { await request("/api/activities", { method: "POST", body: JSON.stringify(input) }); await refresh(); return text(`Added ${String(input.title)} to the shared trip.`); } },
    { name: "remove_activity", title: "Remove activity", description: "Remove an activity from the shared trip by id.", inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] }, execute: async (input) => { await request(`/api/activities/${String(input.id)}`, { method: "DELETE" }); await refresh(); return text("Activity removed from the shared trip."); } },
    { name: "search_activities", title: "Search activities", description: "Search curated activity suggestions for the current destination.", inputSchema: { type: "object", properties: { query: { type: "string" } } }, execute: async (input) => { const results = await request(`/api/search?q=${encodeURIComponent(String(input.query ?? ""))}`) as { title: string }[]; return text(`Found ${results.length} curated suggestion${results.length === 1 ? "" : "s"}${input.query ? ` for “${String(input.query)}”` : ""}.`); } },
  ];
  for (const tool of tools) { if (signal.aborted) break; await context.registerTool(tool); }
  return () => { for (const tool of tools) { try { void context.unregisterTool?.(tool.name); } catch { /* cleanup is best effort */ } } };
}
