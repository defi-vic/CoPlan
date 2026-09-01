export type WebMcpTool = {
  name: string;
  title?: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  execute: (input: Record<string, unknown>, options?: { signal: AbortSignal }) => Promise<unknown>;
};

export type WebMcpContext = { registerTool: (tool: WebMcpTool) => Promise<undefined> };
export type ToolRequest = (path: string, init?: RequestInit) => Promise<unknown>;

export async function registerWebMcpTools(context: WebMcpContext | undefined, request: ToolRequest, refresh: () => Promise<void>) {
  if (!context) return 0;
  const tools: WebMcpTool[] = [
    { name: "get-itinerary", title: "Read shared itinerary", description: "Read the current shared CoPlan itinerary board.", inputSchema: { type: "object", properties: {} }, execute: async () => request("/api/board") },
    { name: "add-itinerary-item", title: "Add itinerary item", description: "Add a structured item to a day on the shared CoPlan itinerary.", inputSchema: { type: "object", properties: { dayId: { type: "string", description: "The target itinerary day id." }, time: { type: "string", description: "24-hour local time, for example 14:30." }, title: { type: "string", description: "The activity name." }, location: { type: "string", description: "Where the activity happens." }, category: { type: "string", enum: ["stay", "food", "culture", "transit", "nature"] }, notes: { type: "string" } }, required: ["dayId", "time", "title", "location", "category"] }, execute: async (input) => { const result = await request("/api/activities", { method: "POST", body: JSON.stringify({ ...input, source: "agent" }) }); await refresh(); return result; } },
    { name: "update-itinerary-item", title: "Update itinerary item", description: "Update a structured item on the shared CoPlan itinerary.", inputSchema: { type: "object", properties: { itemId: { type: "string" }, dayId: { type: "string" }, time: { type: "string" }, title: { type: "string" }, location: { type: "string" }, category: { type: "string", enum: ["stay", "food", "culture", "transit", "nature"] }, notes: { type: "string" } }, required: ["itemId"] }, execute: async ({ itemId, ...input }) => { const result = await request(`/api/activities/${itemId}`, { method: "PATCH", body: JSON.stringify({ ...input, source: "agent" }) }); await refresh(); return result; } },
    { name: "remove-itinerary-item", title: "Remove itinerary item", description: "Remove an item from the shared CoPlan itinerary by id.", inputSchema: { type: "object", properties: { itemId: { type: "string", description: "The item id to remove." } }, required: ["itemId"] }, execute: async ({ itemId }) => { await request(`/api/activities/${itemId}`, { method: "DELETE", body: JSON.stringify({ source: "agent" }) }); await refresh(); return { removed: itemId }; } },
  ];
  for (const tool of tools) await context.registerTool(tool);
  return tools.length;
}
