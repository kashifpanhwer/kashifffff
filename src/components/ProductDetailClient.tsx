"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Share2, BookOpen, Eye, Trash2, Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import ProductCard from "./ProductCard";

export default function ProductDetailClient({ product, relatedProducts }: { product: any; relatedProducts: any[] }) {
  const addToCart = useAppStore((s) => s.addToCart);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const updateQuantity = useAppStore((s) => s.updateQuantity);
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const isInWishlist = useAppStore((s) => s.isInWishlist);
  const cartItem = useAppStore((s) => s.cart.find((i) => i.productId === product.id));
  const [showMore, setShowMore] = useState(false);
  const [imageIdx, setImageIdx] = useState(0);

  const images = [product.image, ...(product.thumbnails || [])].filter(Boolean);
  const whatsappText = `Salam, main ${product.name} (SKU: ${product.sku}) k barey main maloomat chahta/chahti hun.`;
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="mx-auto max-w-7xl px-4 pb-10">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-3xl glass">
            {images[imageIdx] ? (
              <Image src={images[imageIdx]} alt={product.name} fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl">🛍️</div>
            )}
            {product.discount ? (
              <span className="absolute left-3 top-3 rounded-xl bg-[var(--accent)] px-3 py-1 text-sm font-bold text-[var(--bg)]">
                {product.discount}% OFF
              </span>
            ) : null}
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-hide">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => setImageIdx(idx)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 ${imageIdx === idx ? "border-[var(--accent)]" : "border-transparent"}`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">{product.name}</h1>
              {product.urdu && <p className="text-lg text-white/60" dir="rtl">{product.urdu}</p>}
              <p className="mt-1 text-sm text-white/40">SKU: {product.sku} • {product.category?.name} • {product.unit}</p>
            </div>
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`rounded-full p-2 ${isInWishlist(product.id) ? "text-[var(--danger)]" : "text-white/50 hover:text-white"}`}
            >
              <Heart className={`h-6 w-6 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
            </button>
          </div>

          <div className="mt-4 flex items-end gap-3">
            <span className="text-3xl font-bold text-[var(--accent)]">{formatPrice(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-lg text-white/40 line-through">{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          <div className="mt-6 rounded-2xl glass p-4">
            <p className={`text-sm text-white/70 ${showMore ? "" : "line-clamp-3"}`}>
              {product.description || `${product.name} - premium quality product available at Shahmeer Shop.`}
            </p>
            <button onClick={() => setShowMore(!showMore)} className="mt-2 flex items-center gap-1 text-sm font-medium text-[var(--accent)]">
              {showMore ? "Kam Dekhen" : "Aur Dekhen"} {showMore ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-6 flex items-center gap-4">
            {cartItem ? (
              <div className="flex items-center gap-3 rounded-2xl bg-black/30 p-2">
                <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="rounded-xl p-2 hover:bg-white/10">
                  {cartItem.quantity <= 1 ? <Trash2 className="h-5 w-5 text-[var(--danger)]" /> : <Minus className="h-5 w-5" />}
                </button>
                <span className="min-w-[2rem] text-center text-lg font-semibold">{cartItem.quantity}</span>
                <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="rounded-xl p-2 hover:bg-white/10">
                  <Plus className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button onClick={() => addToCart(product.id)} className="btn btn-primary flex-1 text-lg">
                <Plus className="h-5 w-5" /> Add to List
              </button>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <a
              href={`https://wa.me/923192616627?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noreferrer"
              className="btn flex-1 border border-white/10 bg-white/5 text-sm hover:bg-white/10"
            >
              <Share2 className="h-4 w-4" /> WhatsApp
            </a>
            <button
              onClick={() => navigator.clipboard?.writeText(shareUrl)}
              className="btn flex-1 border border-white/10 bg-white/5 text-sm hover:bg-white/10"
            >
              <Share2 className="h-4 w-4" /> Copy Link
            </button>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm text-white/60">
            <div className="rounded-xl bg-white/5 p-3">Stock: <span className="text-white">{product.stock}</span></div>
            <div className="rounded-xl bg-white/5 p-3">Unit: <span className="text-white">{product.unit || "pcs"}</span></div>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold text-white">Related Products</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
