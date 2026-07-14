"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Shell from "@/components/Shell";
import ProductCard from "@/components/ProductCard";
import { Search, SlidersHorizontal, ArrowDownUp } from "lucide-react";

function ShopPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";
  const initialSort = searchParams.get("sort") || "";

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?active=true")
      .then((r) => r.json())
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      });
    fetch("/api/products") // placeholder to fetch categories - we don't have categories endpoint
      .then(() => {});
    fetch("/api/offers")
      .then(() => {});
    // fetch categories from products
  }, []);

  useEffect(() => {
    const cats = Array.from(new Map(products.filter((p) => p.category).map((p) => [p.category.slug, p.category])).values());
    setCategories(cats);
  }, [products]);

  const filtered = products.filter((p) => {
    const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.urdu && p.urdu.includes(search));
    const matchesCategory = !category || p.category?.slug === category;
    return matchesSearch && matchesCategory;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "price_asc") return a.price - b.price;
    if (sort === "price_desc") return b.price - a.price;
    if (sort === "discount") return (b.discount || 0) - (a.discount || 0);
    return 0;
  });

  const updateQuery = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Shop / Sab Saman</h1>
            <p className="text-sm text-white/60">Saman dhundo aur apni list main add karein</p>
          </div>
          <div className="flex flex-1 gap-2 md:max-w-xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); updateQuery("search", e.target.value); }}
                placeholder="Saman Dhundo..."
                className="w-full rounded-full pl-10"
              />
            </div>
            <select
              value={category}
              onChange={(e) => { setCategory(e.target.value); updateQuery("category", e.target.value); }}
              className="rounded-full"
            >
              <option value="">Sab Categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => { setSort(e.target.value); updateQuery("sort", e.target.value); }}
              className="rounded-full"
            >
              <option value="">Sort</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="discount">Discount</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="mt-20 text-center text-white/60">Koi saman nahi mila.</div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sorted.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<Shell><div className="p-10 text-center">Loading...</div></Shell>}>
      <ShopPageContent />
    </Suspense>
  );
}
