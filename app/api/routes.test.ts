import { afterEach, describe, expect, it } from "vitest";
import { GET as getBoard, PATCH as patchBoard, POST as postBoard } from "./board/route";
import { DELETE as deleteDay } from "./board/[id]/route";
import { GET as getActivities, POST as postActivity } from "./activities/route";
import { DELETE as deleteActivity, PATCH as patchActivity } from "./activities/[id]/route";
import { GET as search } from "./search/route";
import { resetBoardForTests } from "@/lib/store";

afterEach(() => resetBoardForTests());
const jsonRequest = (body: unknown) => new Request("http://localhost", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

describe("Next App Router API", () => {
  it("reads and patches board metadata, then creates and deletes a day", async () => {
    expect((await getBoard()).status).toBe(200);
    const patched = await patchBoard(jsonRequest({ title: "A sharper week" }));
    expect((await patched.json()).title).toBe("A sharper week");
    const created = await postBoard(jsonRequest({ date: "2026-10-15", label: "A final morning" }));
    const day = await created.json();
    expect(created.status).toBe(201);
    const removed = await deleteDay(new Request("http://localhost", { method: "DELETE", body: JSON.stringify({ source: "human" }) }), { params: Promise.resolve({ id: day.id }) });
    expect(removed.status).toBe(204);
  });

  it("creates, updates, reads, and deletes an activity through real handlers", async () => {
    const created = await postActivity(jsonRequest({ dayId: "day-1", time: "11:00", title: "Ceramics studio", location: "Gojozaka", category: "culture", notes: "", source: "agent" }));
    const item = await created.json();
    expect(created.status).toBe(201);
    expect(await (await getActivities()).json()).toBeDefined();
    const updated = await patchActivity(jsonRequest({ title: "Ceramics workshop", source: "agent" }), { params: Promise.resolve({ id: item.id }) });
    expect((await updated.json()).title).toBe("Ceramics workshop");
    const removed = await deleteActivity(new Request("http://localhost", { method: "DELETE", body: JSON.stringify({ source: "agent" }) }), { params: Promise.resolve({ id: item.id }) });
    expect(removed.status).toBe(204);
  });

  it("returns filtered search suggestions", async () => {
    const response = await search(new Request("http://localhost/api/search?q=tea"));
    expect((await response.json()).some((item: { title: string }) => item.title.includes("Tea"))).toBe(true);
  });
});
