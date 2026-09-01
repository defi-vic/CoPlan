import { afterEach, describe, expect, it } from "vitest";
import { createItem, getBoard, resetBoardForTests } from "./store";

afterEach(() => resetBoardForTests());

describe("shared in-memory store", () => {
  it("exposes agent-created items through the same board read", () => {
    const created = createItem({ dayId: "day-1", time: "21:00", title: "Night walk", location: "Gion", category: "nature", notes: "", source: "agent" }, "agent");
    const board = getBoard();
    expect(board.days[0]?.items.some((item) => item.id === created.id && item.source === "agent")).toBe(true);
    expect(board.updatedBy).toBe("agent");
  });
});
