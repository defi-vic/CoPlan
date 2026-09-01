import { randomUUID } from "node:crypto";
import type { Activity, ActivityInput, ActivityPatch, Board, BoardPatch } from "./types";

const starterActivities: Activity[] = [
  { id: "activity-1", title: "Check into hotel", cost: 120, notes: "Drop bags and settle in before dinner.", order: 1 },
  { id: "activity-2", title: "Franklin Barbecue lunch", cost: 30, notes: "Arrive early for the brisket line.", order: 2 },
  { id: "activity-3", title: "Zilker Park + Barton Springs", cost: 0, notes: "Bring a towel and a good book.", order: 3 },
];

const board: Board = { destination: "Austin, TX", dates: "Oct 10–12", budget: 500, spent: 0, activities: structuredClone(starterActivities) };

function recompute() { board.spent = board.activities.reduce((sum, activity) => sum + activity.cost, 0); }
function snapshot() { recompute(); return structuredClone(board); }
export function getBoard() { return snapshot(); }
export function updateBoard(input: BoardPatch) { if (input.destination !== undefined) board.destination = input.destination; if (input.dates !== undefined) board.dates = input.dates; if (input.budget !== undefined) board.budget = Math.max(0, Number(input.budget) || 0); return snapshot(); }
export function createActivity(input: ActivityInput) { if (!input.title?.trim()) throw new Error("Activity title is required."); const activity: Activity = { id: `activity-${randomUUID().slice(0, 8)}`, title: input.title.trim(), cost: Math.max(0, Number(input.cost) || 0), notes: input.notes?.trim() ?? "", order: board.activities.length + 1 }; board.activities.push(activity); return snapshot(); }
export function updateActivity(id: string, input: ActivityPatch) { const activity = board.activities.find((candidate) => candidate.id === id); if (!activity) throw new Error("Activity not found."); if (input.title !== undefined) activity.title = input.title.trim(); if (input.cost !== undefined) activity.cost = Math.max(0, Number(input.cost) || 0); if (input.notes !== undefined) activity.notes = input.notes.trim(); return snapshot(); }
export function deleteActivity(id: string) { const index = board.activities.findIndex((candidate) => candidate.id === id); if (index < 0) throw new Error("Activity not found."); board.activities.splice(index, 1); board.activities.forEach((activity, activityIndex) => { activity.order = activityIndex + 1; }); return snapshot(); }
export function resetBoardForTests() { board.destination = "Austin, TX"; board.dates = "Oct 10–12"; board.budget = 500; board.activities = structuredClone(starterActivities); recompute(); }
recompute();
