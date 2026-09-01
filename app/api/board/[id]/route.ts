import { NextResponse } from "next/server";
import { deleteDay } from "@/lib/store";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try { const body = await request.json().catch(() => ({})); const { id } = await params; deleteDay(id, body?.source === "agent" ? "agent" : "human"); return new NextResponse(null, { status: 204 }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete day." }, { status: 404 }); }
}
