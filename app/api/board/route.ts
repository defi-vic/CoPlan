import { NextResponse } from "next/server";
import { getBoard, updateBoard } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() { return NextResponse.json(getBoard()); }
export async function PATCH(request: Request) { try { return NextResponse.json(updateBoard(await request.json())); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update board." }, { status: 400 }); } }
