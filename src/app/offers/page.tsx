"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import OfferCard from "@/components/OfferCard";
import ProductCard from "@/components/ProductCard";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OffersPage() {
  const [offers, setOffers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/offers").then((r) => r.json()), fetch("/api/products?active=true").then((r) => r.json())])
      .then(([offersData, productsData]) => {
        setOffers(Array.isArray(offersData) ? offersData : []);
        setProducts(Array.isArray(productsData) ? productsData : []);
        setLoading(false);
      });
  }, []);

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded-full p-2 hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Special Offers</h1>
            <p className="text-sm text-white/60">Offer mein saman</p>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 h-64 animate-pulse rounded-3xl bg-white/5" />
        ) : (
          <div className="mt-6 space-y-10">
            {offers.map((offer) => {
              const offerProducts = products.filter((p) => offer.productIds?.includes(p.id));
              return (
                <section key={offer.id}>
                  <OfferCard offer={offer} />
                  {offerProducts.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {offerProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
            {offers.length === 0 && <p className="text-center text-white/60">Abhi koi offer available nahi.</p>}
          </div>
        )}
      </div>
    </Shell>
  );
}
