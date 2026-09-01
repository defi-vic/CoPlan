import { NextResponse } from "next/server";

const suggestions = [
  { title: "Lady Bird Lake sunset walk", cost: 0, notes: "An easy downtown loop with skyline views." },
  { title: "Tacos at Veracruz All Natural", cost: 24, notes: "Order the migas taco and a fresh agua fresca." },
  { title: "Live music on Red River", cost: 18, notes: "Check the venue calendar before heading out." },
  { title: "Barton Springs swim", cost: 9, notes: "Bring a towel; mornings are quieter." },
];

export async function GET(request: Request) { const query = new URL(request.url).searchParams.get("q")?.toLowerCase().trim(); const results = query ? suggestions.filter((activity) => `${activity.title} ${activity.notes}`.toLowerCase().includes(query)) : suggestions; return NextResponse.json(results); }
