import { afterEach, describe, expect, it } from "vitest";
import { createActivity, deleteActivity, getBoard, resetBoardForTests, updateActivity } from "./store";

afterEach(() => resetBoardForTests());

describe("shared in-memory store", () => {
  it("recomputes spent after add, update, and remove", () => {
    expect(getBoard().spent).toBe(150);
    const created = createActivity({ title: "Museum", cost: 25, notes: "", });
    expect(getBoard().spent).toBe(175);
    updateActivity(created.activities.at(-1)!.id, { cost: 80 });
    expect(getBoard().spent).toBe(230);
    deleteActivity(created.activities.at(-1)!.id);
    expect(getBoard().spent).toBe(150);
  });
});
