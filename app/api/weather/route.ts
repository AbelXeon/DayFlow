import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q"); // city name OR "lat,lon"
  const key = process.env.NEXT_WEATHER_API_KEY;

  if (!key) return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  if (!q) return NextResponse.json({ error: "Missing location" }, { status: 400 });

  try {
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${encodeURIComponent(q)}&days=3&aqi=no&alerts=yes`,
      { next: { revalidate: 600 } } // 10 min cache — weather doesn't need per-second calls
    );
    const data = await res.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}