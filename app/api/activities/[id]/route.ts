import { NextResponse } from "next/server";
import { deleteActivity, updateActivity } from "@/lib/store";

export async function PATCH(request: Request, { params }: { params: { id: string } }) { try { const activity = updateActivity(params.id, await request.json()); return NextResponse.json(activity); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update activity." }, { status: 404 }); } }
export async function DELETE(_request: Request, { params }: { params: { id: string } }) { try { deleteActivity(params.id); return new NextResponse(null, { status: 204 }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not remove activity." }, { status: 404 }); } }
