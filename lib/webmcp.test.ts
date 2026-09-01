import { describe, expect, it, vi } from "vitest";
import { registerWebMcpTools } from "./webmcp";

describe("WebMCP bridge", () => {
  it("registers four tools that call the real API routes", async () => {
    const registered: { name: string; execute: (input: Record<string, unknown>) => Promise<unknown> }[] = [];
    const calls: Array<[string, RequestInit | undefined]> = [];
    const request = async (path: string, init?: RequestInit) => { calls.push([path, init]); return { ok: true }; };
    await registerWebMcpTools({ registerTool: async (tool) => { registered.push(tool); return undefined; } }, request, async () => undefined);
    expect(registered.map((tool) => tool.name)).toEqual(["get-itinerary", "add-itinerary-item", "update-itinerary-item", "remove-itinerary-item"]);
    await registered[0]!.execute({});
    await registered[1]!.execute({ dayId: "day-1", time: "10:00", title: "Gallery", location: "Gion", category: "culture" });
    await registered[2]!.execute({ itemId: "item-1", title: "Refined stop" });
    await registered[3]!.execute({ itemId: "item-1" });
    expect(calls.map(([path]) => path)).toEqual(["/api/board", "/api/activities", "/api/activities/item-1", "/api/activities/item-1"]);
    expect(calls[1]?.[1]).toMatchObject({ method: "POST" });
    expect(String(calls[1]?.[1]?.body)).toContain('"source":"agent"');
    expect(calls[2]?.[1]).toMatchObject({ method: "PATCH" });
    expect(String(calls[2]?.[1]?.body)).toContain('"source":"agent"');
    expect(calls[3]?.[1]).toMatchObject({ method: "DELETE" });
  });
});
