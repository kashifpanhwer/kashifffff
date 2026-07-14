"use server";

import { db } from "@/db";
import {
  products,
  categories,
  offers,
  orders,
  discountCodes,
  settings,
  adminUsers,
} from "@/db/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

const SESSION_COOKIE = "shahmeer_admin_session";

function hashPw(pw: string) {
  return createHash("sha256").update(pw).digest("hex");
}

async function getSettingsRecord() {
  const rows = await db.select().from(settings).where(eq(settings.key, "store")).limit(1);
  return rows[0] ?? null;
}

export async function adminLogin(password: string) {
  const user = await db.select().from(adminUsers).where(eq(adminUsers.username, "admin")).limit(1);
  if (!user[0] || user[0].passwordHash !== hashPw(password)) {
    return { success: false, error: "Galat password" };
  }
  await db
    .update(adminUsers)
    .set({ lastLogin: new Date() })
    .where(eq(adminUsers.id, user[0].id));

  const token = randomBytes(32).toString("hex");
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return { success: true };
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  return { success: true };
}

export async function adminCheckSession() {
  const cookieStore = await cookies();
  return cookieStore.has(SESSION_COOKIE);
}

async function requireAdmin() {
  const ok = await adminCheckSession();
  if (!ok) throw new Error("Unauthorized");
}

// Products
export async function createProduct(data: Partial<typeof products.$inferInsert>) {
  await requireAdmin();
  const res = await db.insert(products).values(data as any).returning();
  revalidatePath("/");
  revalidatePath("/shop");
  return res[0];
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  await requireAdmin();
  const res = await db
    .update(products)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(products.id, id))
    .returning();
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath(`/product/${id}`);
  return res[0];
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  await db.delete(products).where(eq(products.id, id));
  revalidatePath("/");
  revalidatePath("/shop");
}

// Categories
export async function createCategory(data: Partial<typeof categories.$inferInsert>) {
  await requireAdmin();
  const res = await db.insert(categories).values(data as any).returning();
  revalidatePath("/");
  return res[0];
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  await requireAdmin();
  const res = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
  revalidatePath("/");
  return res[0];
}

export async function deleteCategory(id: number) {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/");
}

// Offers
export async function createOffer(data: Partial<typeof offers.$inferInsert>) {
  await requireAdmin();
  const res = await db.insert(offers).values(data as any).returning();
  revalidatePath("/");
  revalidatePath("/offers");
  return res[0];
}

export async function updateOffer(id: number, data: Partial<typeof offers.$inferInsert>) {
  await requireAdmin();
  const res = await db.update(offers).set(data).where(eq(offers.id, id)).returning();
  revalidatePath("/");
  revalidatePath("/offers");
  return res[0];
}

export async function deleteOffer(id: number) {
  await requireAdmin();
  await db.delete(offers).where(eq(offers.id, id));
  revalidatePath("/");
  revalidatePath("/offers");
}

// Discount codes
export async function createDiscountCode(data: Partial<typeof discountCodes.$inferInsert>) {
  await requireAdmin();
  const res = await db.insert(discountCodes).values(data as any).returning();
  revalidatePath("/admin-shahmeer-guptia");
  return res[0];
}

export async function updateDiscountCode(id: number, data: Partial<typeof discountCodes.$inferInsert>) {
  await requireAdmin();
  const res = await db.update(discountCodes).set(data).where(eq(discountCodes.id, id)).returning();
  return res[0];
}

export async function deleteDiscountCode(id: number) {
  await requireAdmin();
  await db.delete(discountCodes).where(eq(discountCodes.id, id));
}

// Orders
export async function createOrder(data: {
  customerName?: string;
  phone?: string;
  address?: string;
  total: number;
  delivery: number;
  discount: number;
  items: any[];
  whatsappUrl: string;
}) {
  const res = await db.insert(orders).values(data as any).returning();
  return res[0];
}

export async function updateOrderStatus(id: number, status: string) {
  await requireAdmin();
  await db.update(orders).set({ status }).where(eq(orders.id, id));
  revalidatePath("/admin-shahmeer-guptia");
  revalidatePath("/orders");
}

export async function deleteOrder(id: number) {
  await requireAdmin();
  await db.delete(orders).where(eq(orders.id, id));
  revalidatePath("/admin-shahmeer-guptia");
  revalidatePath("/orders");
}

// Settings
export async function updateSettings(value: Record<string, any>) {
  await requireAdmin();
  const existing = await getSettingsRecord();
  const merged = { ...(existing?.value ?? {}), ...value };
  if (existing) {
    await db.update(settings).set({ value: merged, updatedAt: new Date() }).where(eq(settings.id, existing.id));
  } else {
    await db.insert(settings).values({ key: "store", value: merged });
  }
  revalidatePath("/");
  return merged;
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  await requireAdmin();
  const user = await db.select().from(adminUsers).where(eq(adminUsers.username, "admin")).limit(1);
  if (!user[0] || user[0].passwordHash !== hashPw(currentPassword)) {
    return { success: false, error: "Current password galat hai" };
  }
  await db
    .update(adminUsers)
    .set({ passwordHash: hashPw(newPassword) })
    .where(eq(adminUsers.id, user[0].id));
  return { success: true };
}

// Admin analytics
export async function getAdminAnalytics() {
  await requireAdmin();
  const productCount = await db.select({ count: sql<number>`count(*)` }).from(products);
  const orderCount = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const revenue = await db.select({ total: sql<number>`COALESCE(SUM(total),0)` }).from(orders);
  const activeDeals = await db.select({ count: sql<number>`count(*)` }).from(offers).where(sql`${offers.endDate} IS NULL OR ${offers.endDate} >= CURRENT_DATE`);
  const cartItems = 0; // client side only
  const lowStock = await db.select({ count: sql<number>`count(*)` }).from(products).where(sql`${products.stock} <= 20`);
  const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5);
  return {
    productCount: productCount[0].count,
    orderCount: orderCount[0].count,
    revenue: revenue[0].total,
    activeDeals: activeDeals[0].count,
    cartItems,
    lowStock: lowStock[0].count,
    recentOrders,
  };
}

export async function getAdminData() {
  await requireAdmin();
  const [productsList, categoriesList, offersList, ordersList, codesList, settingsRow] = await Promise.all([
    db.select().from(products).orderBy(desc(products.createdAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(offers).orderBy(desc(offers.createdAt)),
    db.select().from(orders).orderBy(desc(orders.createdAt)),
    db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt)),
    getSettingsRecord(),
  ]);
  return {
    products: productsList,
    categories: categoriesList,
    offers: offersList,
    orders: ordersList,
    discountCodes: codesList,
    settings: (settingsRow?.value as Record<string, any>) ?? {},
  };
}

// Data export / import
export async function exportProducts() {
  await requireAdmin();
  return db.select().from(products).orderBy(desc(products.createdAt));
}

export async function exportOrders() {
  await requireAdmin();
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function importProducts(rows: Partial<typeof products.$inferInsert>[]) {
  await requireAdmin();
  if (!rows.length) return { count: 0 };
  const res = await db.insert(products).values(rows as any).returning();
  revalidatePath("/");
  revalidatePath("/shop");
  return { count: res.length };
}
