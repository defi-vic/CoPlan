import { describe, expect, it } from "vitest";
import { registerWebMcpTools } from "./webmcp";

describe("WebMCP bridge", () => {
  it("registers the exact tools and returns human-readable content", async () => {
    const registered: { name: string; execute: (input: Record<string, unknown>) => Promise<any> }[] = [];
    const calls: Array<[string, RequestInit | undefined]> = [];
    const request = async (path: string, init?: RequestInit) => { calls.push([path, init]); return path === "/api/board" ? { destination: "Austin, TX", dates: "Oct 10–12", budget: 500, spent: 150, activities: [{}, {}, {}] } : []; };
    const cleanup = await registerWebMcpTools({ registerTool: async (tool) => { registered.push(tool); } }, request, async () => undefined, new AbortController().signal);
    expect(registered.map((tool) => tool.name)).toEqual(["get_trip_board", "set_trip_details", "add_activity", "remove_activity", "search_activities"]);
    expect((await registered[0]!.execute({})).content[0].text).toContain("Austin, TX");
    expect((await registered[1]!.execute({ budget: 600 })).content[0].text).toContain("updated");
    expect((await registered[2]!.execute({ title: "Museum", cost: 20 })).content[0].text).toContain("Museum");
    expect((await registered[3]!.execute({ id: "activity-1" })).content[0].text).toContain("removed");
    expect((await registered[4]!.execute({ query: "park" })).content[0].text).toContain("suggestion");
    expect(calls.map(([path]) => path)).toEqual(["/api/board", "/api/board", "/api/activities", "/api/activities/activity-1", "/api/search?q=park"]);
    expect(calls[1]?.[1]).toMatchObject({ method: "PATCH" }); expect(calls[2]?.[1]).toMatchObject({ method: "POST" }); expect(calls[3]?.[1]).toMatchObject({ method: "DELETE" });
    cleanup();
  });
  it("fails safely when WebMCP is unavailable or already aborted", async () => {
    let registered = 0; const request = async () => ({ }); const refresh = async () => undefined;
    const missingCleanup = await registerWebMcpTools(undefined, request, refresh, new AbortController().signal);
    const controller = new AbortController(); controller.abort();
    const abortedCleanup = await registerWebMcpTools({ registerTool: () => { registered += 1; } }, request, refresh, controller.signal);
    expect(registered).toBe(0); expect(() => missingCleanup()).not.toThrow(); expect(() => abortedCleanup()).not.toThrow();
  });
});
