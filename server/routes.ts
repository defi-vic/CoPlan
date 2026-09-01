import type { Express, Request, Response } from "express";
import { createDay, createItem, deleteDay, deleteItem, getBoard, updateDay, updateItem } from "./itinerary";

function sendError(res: Response, error: unknown) {
  const message = error instanceof Error ? error.message : "Request could not be completed.";
  const status = message.includes("not found") ? 404 : 400;
  res.status(status).json({ error: message });
}

export function registerItineraryRoutes(app: Express) {
  app.get("/api/itinerary", (_req, res) => res.json(getBoard()));
  app.post("/api/itinerary/days", (req, res) => { try { res.status(201).json(createDay(req.body, req.body?.source === "agent" ? "agent" : "human")); } catch (error) { sendError(res, error); } });
  app.patch("/api/itinerary/days/:dayId", (req, res) => { try { res.json(updateDay(req.params.dayId, req.body, req.body?.source === "agent" ? "agent" : "human")); } catch (error) { sendError(res, error); } });
  app.delete("/api/itinerary/days/:dayId", (req, res) => { try { deleteDay(req.params.dayId, req.body?.source === "agent" ? "agent" : "human"); res.status(204).end(); } catch (error) { sendError(res, error); } });
  app.post("/api/itinerary/items", (req, res) => { try { res.status(201).json(createItem(req.body, req.body?.source === "agent" ? "agent" : "human")); } catch (error) { sendError(res, error); } });
  app.patch("/api/itinerary/items/:itemId", (req, res) => { try { res.json(updateItem(req.params.itemId, req.body, req.body?.source === "agent" ? "agent" : "human")); } catch (error) { sendError(res, error); } });
  app.delete("/api/itinerary/items/:itemId", (req, res) => { try { deleteItem(req.params.itemId, req.body?.source === "agent" ? "agent" : "human"); res.status(204).end(); } catch (error) { sendError(res, error); } });
}
