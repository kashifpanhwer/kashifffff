import { NextResponse } from "next/server";
import { getOffers } from "@/lib/data";

export async function GET() {
  try {
    const offers = await getOffers();
    return NextResponse.json(offers);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
