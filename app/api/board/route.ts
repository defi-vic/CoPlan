import { NextResponse } from "next/server";
import { createDay, getBoard, updateBoard } from "@/lib/store";

export async function GET() { return NextResponse.json(getBoard()); }
export async function PATCH(request: Request) { const body = await request.json(); return NextResponse.json(updateBoard(body, body?.source === "agent" ? "agent" : "human")); }
export async function POST(request: Request) { try { const body = await request.json(); return NextResponse.json(createDay(body, body?.source === "agent" ? "agent" : "human"), { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create day." }, { status: 400 }); } }
