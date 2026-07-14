import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/data";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") ?? undefined;
  const categorySlug = searchParams.get("category") ?? undefined;
  const sort = searchParams.get("sort") as NonNullable<Parameters<typeof getProducts>[0]>["sort"];
  const active = searchParams.get("active") === "true" ? true : undefined;

  try {
    const products = await getProducts({ search, categorySlug, sort, active });
    return NextResponse.json(products);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
