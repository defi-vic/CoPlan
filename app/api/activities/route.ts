import { NextResponse } from "next/server";
import { createActivity, getBoard } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() { return NextResponse.json(getBoard()); }
export async function POST(request: Request) { try { const activity = createActivity(await request.json()); return NextResponse.json(activity, { status: 201 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not add activity." }, { status: 400 }); } }
