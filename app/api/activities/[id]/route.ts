import { NextResponse } from "next/server";
import { deleteItem, updateItem } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const body = await request.json(); const { id } = await params; return NextResponse.json(updateItem(id, body, body?.source === "agent" ? "agent" : "human")); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update activity." }, { status: 404 }); }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const body = await request.json().catch(() => ({})); const { id } = await params; deleteItem(id, body?.source === "agent" ? "agent" : "human"); return new NextResponse(null, { status: 204 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete activity." }, { status: 404 }); }
}
