import { NextRequest, NextResponse } from "next/server";
import { getValidDiscountCode } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code") || "";
  const subtotal = Number(searchParams.get("subtotal") || "0");
  if (!code) return NextResponse.json({ error: "Code enter karein" }, { status: 400 });

  const dc = await getValidDiscountCode(code.toUpperCase());
  if (!dc) return NextResponse.json({ error: "Code valid nahi hai" }, { status: 400 });
  if (subtotal < (dc.minPurchase || 0)) {
    return NextResponse.json({ error: `Minimum ${dc.minPurchase} PKR required` }, { status: 400 });
  }
  const discount = dc.type === "percent" ? Math.round((subtotal * dc.value) / 100) : dc.value;
  return NextResponse.json({ discount, code: dc.code, type: dc.type, value: dc.value });
}
