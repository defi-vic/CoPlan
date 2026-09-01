import { NextResponse } from "next/server";

const suggestions = [
  { title: "Nishiki Market breakfast", location: "Nishiki Market", category: "food", time: "09:00" },
  { title: "Philosopher’s Path", location: "Higashiyama", category: "nature", time: "10:30" },
  { title: "Kiyomizu-dera at golden hour", location: "Otowa", category: "culture", time: "17:00" },
  { title: "Tea ceremony in Uji", location: "Uji", category: "culture", time: "14:00" },
];

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q")?.toLowerCase().trim();
  const results = query ? suggestions.filter((item) => `${item.title} ${item.location} ${item.category}`.toLowerCase().includes(query)) : suggestions;
  return NextResponse.json(results);
}
