import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const base = req.nextUrl.searchParams.get("base") || "USD";
  const key = process.env.EXCHANGE_RATE_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const res = await fetch(
      `https://v6.exchangerate-api.com/v6/${key}/latest/${base}`,
      { next: { revalidate: 3600 } } // cache 1 hour — rates don't change minute to minute
    );
    const data = await res.json();

    if (data.result !== "success") {
      return NextResponse.json({ error: "Provider error" }, { status: 502 });
    }

    return NextResponse.json({
      base: data.base_code,
      rates: data.conversion_rates,
      updated: data.time_last_update_utc,
    });
  } catch {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }
}


