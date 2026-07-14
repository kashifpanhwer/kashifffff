import Shell from "@/components/Shell";
import ProductCard from "@/components/ProductCard";
import OfferCard from "@/components/OfferCard";
import { getProducts, getCategories, getFeaturedOffers, getSettings } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Truck, Clock, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featuredProducts, offers, settings] = await Promise.all([
    getCategories(),
    getProducts({ featured: true, active: true, sort: "discount" }),
    getFeaturedOffers(),
    getSettings(),
  ]);

  const cheapest = featuredProducts.filter((p) => (p.discount ?? 0) > 0).slice(0, 6);
  const household = featuredProducts.filter((p) => p.category?.slug === "household").slice(0, 4);

  return (
    <Shell>
      {/* Hero */}
      <section className="relative mx-4 overflow-hidden rounded-3xl bg-gradient-to-br from-[var(--bg-light)] to-[var(--bg)] p-6 md:p-12 lg:mx-auto lg:max-w-7xl">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-medium text-[var(--accent)]">آپکی محلہ کی دکان</p>
          <h1 className="mt-3 text-4xl font-bold leading-tight text-white md:text-5xl">
            SHAHMEER <span className="text-gradient">SHOP</span>
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Apne ghar ka saman order karein. Fresh groceries, masalain, drinks aur bohat kuch — Mirpurkhas ki trusted dukan se.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/shop" className="btn btn-primary">Abhi Order Karen</Link>
            <Link href="/offers" className="btn border border-white/20 bg-white/5 text-white hover:bg-white/10">Special Offers</Link>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-[var(--accent)]/10 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-[var(--secondary)]/10 blur-3xl" />
      </section>

      {/* Features */}
      <section className="mx-auto mt-8 grid max-w-7xl grid-cols-2 gap-3 px-4 md:grid-cols-4">
        {[
          { icon: ShoppingBag, text: "Fresh Quality" },
          { icon: Truck, text: "Fast Delivery" },
          { icon: Clock, text: "Daily Open" },
          { icon: ShieldCheck, text: "Best Prices" },
        ].map((f) => (
          <div key={f.text} className="flex items-center gap-3 rounded-2xl glass p-4">
            <f.icon className="h-6 w-6 text-[var(--accent)]" />
            <span className="text-sm font-medium">{f.text}</span>
          </div>
        ))}
      </section>

      {/* Categories */}
      <section className="mx-auto mt-10 max-w-7xl px-4">
        <h2 className="text-xl font-bold text-white">Categories</h2>
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="flex flex-col items-center gap-2 rounded-2xl glass p-4 transition hover:-translate-y-1 hover:bg-white/10"
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-center text-xs font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Special Offers */}
      {offers.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Special Offers / Offer Mein Saman</h2>
            <Link href="/offers" className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline">Aur Dekhen <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {offers.slice(0, 2).map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      {/* Good Deals */}
      {cheapest.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Good Deals / Sab Se Arzan</h2>
            <Link href="/shop?sort=discount" className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline">Aur Dekhen <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {cheapest.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Household */}
      {household.length > 0 && (
        <section className="mx-auto mt-10 max-w-7xl px-4 pb-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Ghar Ka Saman</h2>
            <Link href="/shop?category=household" className="flex items-center gap-1 text-sm text-[var(--accent)] hover:underline">Aur Dekhen <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {household.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </Shell>
  );
}
