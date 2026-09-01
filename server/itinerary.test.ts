import { beforeEach, describe, expect, it } from "vitest";
import { createItem, deleteItem, getBoard, resetBoardForTests, updateItem } from "./itinerary";

describe("shared itinerary store", () => {
  beforeEach(() => resetBoardForTests());

  it("adds, updates, and removes an agent-originated item in shared state", () => {
    const initial = getBoard();
    const dayId = initial.days[0]!.id;
    const created = createItem({ dayId, time: "21:00", title: "Night walk by the Kamo", location: "Kamo River", category: "nature", notes: "A quiet final loop.", source: "agent" }, "agent");
    expect(getBoard().days[0]!.items.some((item) => item.id === created.id && item.source === "agent")).toBe(true);

    const updated = updateItem(created.id, { title: "Kamo River night walk", notes: "Keep it unhurried." }, "agent");
    expect(updated.title).toBe("Kamo River night walk");
    expect(getBoard().updatedBy).toBe("agent");

    deleteItem(created.id, "agent");
    expect(getBoard().days[0]!.items.some((item) => item.id === created.id)).toBe(false);
  });

  it("returns cloned board snapshots so callers cannot mutate the store directly", () => {
    const snapshot = getBoard();
    snapshot.days[0]!.label = "tampered";
    expect(getBoard().days[0]!.label).not.toBe("tampered");
  });
});
