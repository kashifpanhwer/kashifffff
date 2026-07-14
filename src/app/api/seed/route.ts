import { db } from "@/db";
import { categories, products, offers, settings, adminUsers } from "@/db/schema";
import { sql } from "drizzle-orm";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

const categoryList = [
  { name: "Masalain", urdu: "مسالے", slug: "spices", icon: "🌶️" },
  { name: "Rashan", urdu: "راشن", slug: "grocery", icon: "🍚" },
  { name: "Drinks", urdu: "مشروبات", slug: "drinks", icon: "🥤" },
  { name: "Beauty", urdu: "بیوٹی", slug: "beauty", icon: "💄" },
  { name: "Household", urdu: "گھریلو", slug: "household", icon: "🏠" },
  { name: "Snacks", urdu: "ناشتے", slug: "snacks", icon: "🍪" },
  { name: "Dairy", urdu: "دودھ", slug: "dairy", icon: "🥛" },
  { name: "Cleaning", urdu: "صاف ستھرا", slug: "cleaning", icon: "🧼" },
  { name: "Other", urdu: "دیگر", slug: "other", icon: "📦" },
];

const productList = [
  { name: "Shan Biryani Masala", urdu: "شان بریانی مسالہ", sku: "001", category: "spices", price: 45, original: 60, discount: 25, stock: 120, unit: "50g" },
  { name: "Shan Karahi Masala", urdu: "شان کڑاہی مسالہ", sku: "002", category: "spices", price: 35, original: 50, discount: 30, stock: 95, unit: "50g" },
  { name: "Red Chilli Powder", urdu: "لال مرچ پاؤڈر", sku: "003", category: "spices", price: 120, original: 150, discount: 20, stock: 60, unit: "200g" },
  { name: "White Rice Basmati 5kg", urdu: "سفید چاول باسمتی", sku: "004", category: "grocery", price: 650, original: 750, discount: 13, stock: 30, unit: "5kg" },
  { name: "Wheat Flour (Maida) 2kg", urdu: "میدہ آٹا", sku: "005", category: "grocery", price: 220, original: 280, discount: 21, stock: 45, unit: "2kg" },
  { name: "Cooking Oil 1 Liter", urdu: "کھانے کا تیل", sku: "006", category: "grocery", price: 380, original: 450, discount: 16, stock: 50, unit: "1L" },
  { name: "Nescafé Coffee 200g", urdu: "نیسکافے کافی", sku: "007", category: "drinks", price: 180, original: 220, discount: 18, stock: 45, unit: "200g" },
  { name: "Sprite Bottle 1.5L", urdu: "سپرائٹ بوتل", sku: "008", category: "drinks", price: 80, original: 100, discount: 20, stock: 120, unit: "1.5L" },
  { name: "Lipton Tea Bags 50s", urdu: "لپٹن چائے", sku: "009", category: "drinks", price: 90, original: 120, discount: 25, stock: 70, unit: "50 bags" },
  { name: "Colgate Toothpaste 100ml", urdu: "کولگیٹ ٹوتھ پیسٹ", sku: "010", category: "beauty", price: 70, original: 85, discount: 18, stock: 200, unit: "100ml" },
  { name: "Lux Beauty Soap", urdu: "لکس صابن", sku: "011", category: "beauty", price: 40, original: 50, discount: 20, stock: 150, unit: "100g" },
  { name: "Detergent Powder 1kg", urdu: "ڈیٹرجنٹ پاؤڈر", sku: "012", category: "household", price: 150, original: 200, discount: 25, stock: 80, unit: "1kg" },
  { name: "Tissue Paper Roll", urdu: "ٹشو پیپر", sku: "013", category: "household", price: 25, original: 30, discount: 17, stock: 300, unit: "1 roll" },
  { name: "Doritos Chips 45g", urdu: "ڈوریٹوس چپس", sku: "014", category: "snacks", price: 60, original: 75, discount: 20, stock: 100, unit: "45g" },
  { name: "Biscuit Box (Heiwa)", urdu: "بسکٹ ڈبہ", sku: "015", category: "snacks", price: 110, original: 140, discount: 21, stock: 60, unit: "400g" },
];

const imgUrl = (id: number) => `https://picsum.photos/seed/shahmeer${id}/400/400`;

export async function POST() {
  try {
    const existing = await db.select({ count: sql<number>`count(*)` }).from(categories);
    if (existing[0].count > 0) {
      return NextResponse.json({ message: "Already seeded" });
    }

    const insertedCategories = await db.insert(categories).values(categoryList).returning();
    const catMap = new Map(insertedCategories.map((c) => [c.slug, c.id]));

    const productRows = productList.map((p, idx) => ({
      name: p.name,
      urdu: p.urdu,
      sku: p.sku,
      categoryId: catMap.get(p.category) ?? null,
      price: p.price,
      originalPrice: p.original,
      discount: p.discount,
      image: imgUrl(idx + 1),
      thumbnails: [imgUrl(idx + 1), imgUrl(idx + 100)],
      description: `${p.name} - premium quality. Best price in Mirpurkhas.`,
      stock: p.stock,
      unit: p.unit,
      active: true,
      featured: idx < 6,
    }));

    const insertedProducts = await db.insert(products).values(productRows).returning();

    await db.insert(offers).values({
      name: "Shan Masala Special Offer",
      urdu: "شان مسالہ خصوصی پیشکش",
      discount: 25,
      image: "https://picsum.photos/seed/offer1/800/400",
      featured: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      productIds: insertedProducts.filter((p) => p.categoryId === catMap.get("spices")).map((p) => p.id),
      description: "Special discount on all Shan masalas for a limited time.",
    });

    await db.insert(settings).values({
      key: "store",
      value: {
        shopName: "Shahmeer Shop",
        urduName: "شاہمیر شاپ",
        location: "Mirpurkhas, Sindh, Pakistan",
        address: "Main Bazaar, Mirpurkhas",
        whatsapp: "+92 319 2616627",
        email: "contact@shahmeershop.pk",
        phone: "+92 319 2616627",
        currency: "PKR",
        deliveryCharge: 50,
        freeDeliveryMin: 2000,
        taxRate: 0,
        sessionTimeout: 1800,
        brandColor: "#7eff57",
      },
    });

    await db.insert(adminUsers).values({
      username: "admin",
      passwordHash: createHash("sha256").update("shahmeer2024").digest("hex"),
      role: "owner",
      active: true,
    });

    return NextResponse.json({ success: true, products: insertedProducts.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
