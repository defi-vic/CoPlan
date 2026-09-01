import { randomUUID } from "node:crypto";
import type {
  CreateDayInput,
  CreateItemInput,
  ItineraryBoard,
  ItineraryDay,
  ItineraryItem,
  UpdateDayInput,
  UpdateItemInput,
} from "../shared/types";

const now = () => new Date().toISOString();

const board: ItineraryBoard = {
  title: "A week in Kyoto",
  destination: "KYOTO / 7 DAYS",
  updatedAt: now(),
  updatedBy: "system",
  days: [
    {
      id: "day-1",
      date: "2026-10-12",
      label: "Arrival & lantern light",
      items: [
        { id: "item-1", dayId: "day-1", time: "16:30", title: "Check in at The Machiya Inn", location: "Gion", category: "stay", notes: "Leave bags, then walk east toward Yasaka Shrine.", source: "human" },
        { id: "item-2", dayId: "day-1", time: "19:00", title: "Izakaya dinner", location: "Pontocho Alley", category: "food", notes: "Look for a counter seat and seasonal obanzai.", source: "human" },
      ],
    },
    {
      id: "day-2",
      date: "2026-10-13",
      label: "Moss, cedar & stillness",
      items: [
        { id: "item-3", dayId: "day-2", time: "08:00", title: "Arashiyama bamboo grove", location: "Arashiyama", category: "nature", notes: "Arrive before the tour buses.", source: "human" },
        { id: "item-4", dayId: "day-2", time: "13:30", title: "Tenryu-ji garden", location: "Saga Tenryu-ji", category: "culture", notes: "Take the north gate exit toward the river.", source: "human" },
      ],
    },
    {
      id: "day-3",
      date: "2026-10-14",
      label: "A city in vermilion",
      items: [
        { id: "item-5", dayId: "day-3", time: "07:15", title: "Fushimi Inari Taisha", location: "Fushimi", category: "culture", notes: "Climb to the Yotsutsuji viewpoint if energy allows.", source: "human" },
      ],
    },
  ],
};

const seedDays = structuredClone(board.days);

function touch(source: "human" | "agent" | "system") {
  board.updatedAt = now();
  board.updatedBy = source;
}

export function getBoard(): ItineraryBoard {
  return structuredClone(board);
}

export function createDay(input: CreateDayInput, source: "human" | "agent" = "human"): ItineraryDay {
  if (!input.date || !input.label) throw new Error("A day needs a date and a label.");
  const day: ItineraryDay = { id: `day-${randomUUID().slice(0, 8)}`, date: input.date, label: input.label, items: [] };
  board.days.push(day);
  board.days.sort((a, b) => a.date.localeCompare(b.date));
  touch(source);
  return structuredClone(day);
}

export function updateDay(id: string, input: UpdateDayInput, source: "human" | "agent" = "human"): ItineraryDay {
  const day = board.days.find((candidate) => candidate.id === id);
  if (!day) throw new Error("Day not found.");
  if (input.date !== undefined) day.date = input.date;
  if (input.label !== undefined) day.label = input.label;
  board.days.sort((a, b) => a.date.localeCompare(b.date));
  touch(source);
  return structuredClone(day);
}

export function deleteDay(id: string, source: "human" | "agent" = "human"): void {
  const index = board.days.findIndex((candidate) => candidate.id === id);
  if (index === -1) throw new Error("Day not found.");
  board.days.splice(index, 1);
  touch(source);
}

export function createItem(input: CreateItemInput, source: "human" | "agent" = input.source ?? "human"): ItineraryItem {
  const day = board.days.find((candidate) => candidate.id === input.dayId);
  if (!day) throw new Error("Day not found.");
  if (!input.title || !input.time || !input.location) throw new Error("An item needs a time, title, and location.");
  const item: ItineraryItem = { id: `item-${randomUUID().slice(0, 8)}`, dayId: input.dayId, time: input.time, title: input.title, location: input.location, category: input.category ?? "culture", notes: input.notes ?? "", source };
  day.items.push(item);
  day.items.sort((a, b) => a.time.localeCompare(b.time));
  touch(source);
  return structuredClone(item);
}

export function updateItem(id: string, input: UpdateItemInput, source: "human" | "agent" = input.source ?? "human"): ItineraryItem {
  const currentDay = board.days.find((candidate) => candidate.items.some((item) => item.id === id));
  if (!currentDay) throw new Error("Item not found.");
  const item = currentDay.items.find((candidate) => candidate.id === id)!;
  if (input.dayId && input.dayId !== currentDay.id) {
    const newDay = board.days.find((candidate) => candidate.id === input.dayId);
    if (!newDay) throw new Error("Target day not found.");
    currentDay.items = currentDay.items.filter((candidate) => candidate.id !== id);
    newDay.items.push(item);
    item.dayId = input.dayId;
  }
  if (input.time !== undefined) item.time = input.time;
  if (input.title !== undefined) item.title = input.title;
  if (input.location !== undefined) item.location = input.location;
  if (input.category !== undefined) item.category = input.category;
  if (input.notes !== undefined) item.notes = input.notes;
  item.source = source;
  board.days.forEach((day) => day.items.sort((a, b) => a.time.localeCompare(b.time)));
  touch(source);
  return structuredClone(item);
}

export function deleteItem(id: string, source: "human" | "agent" = "human"): void {
  for (const day of board.days) {
    const index = day.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      day.items.splice(index, 1);
      touch(source);
      return;
    }
  }
  throw new Error("Item not found.");
}

export function resetBoardForTests() {
  board.days = structuredClone(seedDays);
  board.updatedAt = now();
  board.updatedBy = "system";
}
