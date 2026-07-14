import { db } from "@/db";
import { products, categories, offers, orders, settings, discountCodes } from "@/db/schema";
import { eq, desc, asc, like, or, and, sql, inArray, gte, lte } from "drizzle-orm";

export async function getCategories() {
  return db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.sortOrder));
}

export async function getCategoryBySlug(slug: string) {
  return db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
}

export async function getProducts(opts?: {
  search?: string;
  categorySlug?: string;
  featured?: boolean;
  active?: boolean;
  sort?: "price_asc" | "price_desc" | "newest" | "discount";
}) {
  const { search, categorySlug, featured, active, sort } = opts ?? {};
  let categoryId: number | undefined;
  if (categorySlug) {
    const cat = await getCategoryBySlug(categorySlug);
    categoryId = cat[0]?.id;
  }

  const conditions = [];
  if (categoryId) conditions.push(eq(products.categoryId, categoryId));
  if (typeof featured === "boolean") conditions.push(eq(products.featured, featured));
  if (typeof active === "boolean") conditions.push(eq(products.active, active));
  if (search) {
    conditions.push(
      or(
        like(sql`LOWER(${products.name})`, `%${search.toLowerCase()}%`),
        like(sql`LOWER(${products.urdu})`, `%${search.toLowerCase()}%`),
        like(sql`LOWER(${products.sku})`, `%${search.toLowerCase()}%`)
      )
    );
  }

  const orderBy =
    sort === "price_asc"
      ? asc(products.price)
      : sort === "price_desc"
      ? desc(products.price)
      : sort === "discount"
      ? desc(products.discount)
      : desc(products.createdAt);

  const rows = await db
    .select({
      product: products,
      category: categories,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderBy);

  return rows.map((r) => ({ ...r.product, category: r.category }));
}

export async function getProductById(id: number) {
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
    .limit(1);
  return rows[0] ? { ...rows[0].product, category: rows[0].category } : null;
}

export async function getFeaturedOffers() {
  return db.select().from(offers).where(eq(offers.featured, true)).orderBy(desc(offers.createdAt));
}

export async function getOffers() {
  return db.select().from(offers).orderBy(desc(offers.createdAt));
}

export async function getOfferById(id: number) {
  return db.select().from(offers).where(eq(offers.id, id)).limit(1);
}

export async function getSettings() {
  const rows = await db.select().from(settings).where(eq(settings.key, "store")).limit(1);
  return (rows[0]?.value as Record<string, any>) ?? {};
}

export async function getOrders() {
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function getDiscountCodes() {
  return db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
}

export async function getValidDiscountCode(code: string) {
  const now = new Date();
  const rows = await db
    .select()
    .from(discountCodes)
    .where(
      and(
        eq(discountCodes.code, code.toUpperCase()),
        eq(discountCodes.active, true),
        or(lte(discountCodes.validFrom, now), sql`${discountCodes.validFrom} IS NULL`),
        or(gte(discountCodes.validTo, now), sql`${discountCodes.validTo} IS NULL`),
        or(sql`${discountCodes.maxUses} IS NULL`, gte(discountCodes.maxUses, discountCodes.used))
      )
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function getAnalytics() {
  const productCount = await db.select({ count: sql<number>`count(*)` }).from(products);
  const orderCount = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const revenue = await db.select({ total: sql<number>`COALESCE(SUM(total),0)` }).from(orders);
  const lowStock = await db
    .select({ count: sql<number>`count(*)` })
    .from(products)
    .where(sql`${products.stock} <= 20`);
  const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
  return {
    productCount: productCount[0].count,
    orderCount: orderCount[0].count,
    revenue: revenue[0].total,
    lowStock: lowStock[0].count,
    recentOrders,
  };
}

export async function getBestSellers() {
  const rows = await db.execute(sql`
    SELECT p.id, p.name, p.urdu, p.image, p.price,
      COALESCE(SUM((item->>'quantity')::int), 0) as sold
    FROM products p
    LEFT JOIN orders o ON o.items @> jsonb_build_array(jsonb_build_object('productId', p.id))
    CROSS JOIN LATERAL jsonb_array_elements(o.items) as item
    WHERE (item->>'productId')::int = p.id
    GROUP BY p.id
    ORDER BY sold DESC
    LIMIT 10
  `);
  return rows.rows as any[];
}
