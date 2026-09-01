import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { resetBoardForTests } from "./itinerary";
import { registerItineraryRoutes } from "./routes";

const app = express();
app.use(express.json());
registerItineraryRoutes(app);

describe("itinerary REST routes", () => {
  beforeEach(() => resetBoardForTests());

  it("reads the shared board and performs a real item lifecycle", async () => {
    const initial = await request(app).get("/api/itinerary");
    expect(initial.status).toBe(200);
    const dayId = initial.body.days[0].id;

    const created = await request(app).post("/api/itinerary/items").send({ dayId, time: "20:00", title: "Kamo River stroll", location: "Kamo River", category: "nature", notes: "", source: "agent" });
    expect(created.status).toBe(201);
    expect(created.body.source).toBe("agent");

    const updated = await request(app).patch(`/api/itinerary/items/${created.body.id}`).send({ title: "Kamo River at dusk", source: "human" });
    expect(updated.status).toBe(200);
    expect(updated.body.title).toBe("Kamo River at dusk");

    const removed = await request(app).delete(`/api/itinerary/items/${created.body.id}`).send({ source: "agent" });
    expect(removed.status).toBe(204);
    expect((await request(app).get("/api/itinerary")).body.days[0].items.some((item: { id: string }) => item.id === created.body.id)).toBe(false);
  });

  it("returns a useful error for unknown items", async () => {
    const response = await request(app).patch("/api/itinerary/items/missing").send({ title: "Nope" });
    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Item not found.");
  });
});
