import { afterEach, describe, expect, it } from "vitest";
import { GET as getBoard, PATCH as patchBoard } from "./board/route";
import { GET as getActivities, POST as postActivity } from "./activities/route";
import { DELETE as deleteActivity, PATCH as patchActivity } from "./activities/[id]/route";
import { GET as search } from "./search/route";
import { resetBoardForTests } from "@/lib/store";

afterEach(() => resetBoardForTests());
const jsonRequest = (body: unknown, method = "POST") => new Request("http://localhost", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) });

describe("Next App Router API", () => {
  it("reads and patches board metadata", async () => {
    expect((await getBoard()).status).toBe(200);
    const response = await patchBoard(jsonRequest({ destination: "Austin, TX", dates: "Oct 10–12", budget: 600 }, "PATCH"));
    expect((await response.json()).budget).toBe(600);
  });
  it("creates, updates, reads, and deletes an activity through real handlers", async () => {
    const created = await postActivity(jsonRequest({ title: "Ceramics studio", cost: 25, notes: "", }));
    const item = (await created.json()).activities.at(-1);
    expect(created.status).toBe(201);
    expect((await getActivities()).status).toBe(200);
    const updated = await patchActivity(jsonRequest({ title: "Ceramics workshop" }, "PATCH"), { params: { id: item.id } });
    expect((await updated.json()).activities.at(-1).title).toBe("Ceramics workshop");
    const removed = await deleteActivity(new Request("http://localhost", { method: "DELETE" }), { params: { id: item.id } });
    expect(removed.status).toBe(204);
  });
  it("returns curated filtered suggestions", async () => {
    const response = await search(new Request("http://localhost/api/search?q=swim"));
    expect((await response.json())[0].title).toContain("Barton Springs");
  });
});
