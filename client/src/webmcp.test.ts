import { describe, expect, it, vi } from "vitest";
import { registerWebMcpTools } from "./webmcp";

describe("WebMCP tool bridge", () => {
  it("registers read, add, update, and remove tools with real route handlers", async () => {
    const requests: { path: string; init?: RequestInit }[] = [];
    const context = { registerTool: vi.fn(async () => undefined) };
    const request = vi.fn(async (path: string, init?: RequestInit) => { requests.push({ path, init }); return { ok: true }; });
    const refresh = vi.fn(async () => undefined);
    const count = await registerWebMcpTools(context, request, refresh);
    expect(count).toBe(4);
    expect(context.registerTool).toHaveBeenCalledTimes(4);

    const tools = context.registerTool.mock.calls.map(([tool]) => tool);
    await tools[0]!.execute({});
    await tools[1]!.execute({ dayId: "day-1", time: "11:00", title: "Tea", location: "Uji", category: "food" });
    await tools[2]!.execute({ itemId: "item-1", title: "Updated" });
    await tools[3]!.execute({ itemId: "item-1" });

    expect(requests.map((entry) => entry.path)).toEqual(["/api/itinerary", "/api/itinerary/items", "/api/itinerary/items/item-1", "/api/itinerary/items/item-1"]);
    expect(JSON.parse(requests[1]!.init!.body as string).source).toBe("agent");
    expect(JSON.parse(requests[2]!.init!.body as string).source).toBe("agent");
    expect(JSON.parse(requests[3]!.init!.body as string).source).toBe("agent");
    expect(refresh).toHaveBeenCalledTimes(3);
  });
});
