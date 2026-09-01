import { NextResponse } from "next/server";
import { createItem, getBoard } from "@/lib/store";

export async function GET() {
  const items = getBoard().days.flatMap((day) => day.items);
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(createItem(body, body?.source === "agent" ? "agent" : "human"), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create activity." }, { status: 400 });
  }
}
