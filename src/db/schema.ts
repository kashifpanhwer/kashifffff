import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  date,
  index,
} from "drizzle-orm/pg-core";

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    urdu: text("urdu"),
    slug: text("slug").notNull().unique(),
    icon: text("icon"),
    sortOrder: integer("sort_order").default(0),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => [index("category_slug_idx").on(table.slug)]
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    urdu: text("urdu"),
    sku: text("sku").notNull().unique(),
    categoryId: integer("category_id").references(() => categories.id),
    price: integer("price").notNull(),
    originalPrice: integer("original_price"),
    discount: integer("discount").default(0),
    image: text("image"),
    thumbnails: text("thumbnails").array(),
    description: text("description"),
    stock: integer("stock").default(0),
    unit: text("unit"),
    expiry: date("expiry", { mode: "date" }),
    active: boolean("active").default(true),
    featured: boolean("featured").default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
  },
  (table) => [index("product_category_idx").on(table.categoryId)]
);

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  urdu: text("urdu"),
  discount: integer("discount").default(0),
  image: text("image"),
  featured: boolean("featured").default(false),
  startDate: date("start_date", { mode: "date" }),
  endDate: date("end_date", { mode: "date" }),
  productIds: integer("product_ids").array(),
  description: text("description"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const discountCodes = pgTable(
  "discount_codes",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull().unique(),
    type: text("type").notNull(), // 'fixed' | 'percent'
    value: integer("value").notNull(),
    minPurchase: integer("min_purchase").default(0),
    maxUses: integer("max_uses"),
    used: integer("used").default(0),
    validFrom: date("valid_from", { mode: "date" }),
    validTo: date("valid_to", { mode: "date" }),
    active: boolean("active").default(true),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  },
  (table) => [index("discount_code_idx").on(table.code)]
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name"),
  phone: text("phone"),
  address: text("address"),
  status: text("status").default("pending"), // pending | delivered | cancelled
  total: integer("total").notNull(),
  delivery: integer("delivery").default(0),
  discount: integer("discount").default(0),
  items: jsonb("items").notNull(),
  whatsappUrl: text("whatsapp_url"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").default("owner"), // owner | editor | viewer
  active: boolean("active").default(true),
  lastLogin: timestamp("last_login", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type Offer = typeof offers.$inferSelect;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
export type Setting = typeof settings.$inferSelect;
