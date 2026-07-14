"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Plus, Minus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

export interface ProductCardProps {
  product: {
    id: number;
    name: string;
    urdu?: string | null;
    price: number;
    originalPrice?: number | null;
    discount?: number | null;
    image?: string | null;
    unit?: string | null;
    stock?: number | null;
    category?: { name: string; urdu?: string | null } | null;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const addToCart = useAppStore((s) => s.addToCart);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const updateQuantity = useAppStore((s) => s.updateQuantity);
  const toggleWishlist = useAppStore((s) => s.toggleWishlist);
  const isInWishlist = useAppStore((s) => s.isInWishlist);
  const cartItem = useAppStore((s) => s.cart.find((i) => i.productId === product.id));

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl glass transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.12]">
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-white/5 text-4xl">🛍️</div>
        )}
        {!!product.discount && (
          <span className="absolute left-2 top-2 rounded-lg bg-[var(--accent)] px-2 py-0.5 text-xs font-bold text-[var(--bg)]">
            {product.discount}% OFF
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/product/${product.id}`} className="flex-1">
            <h3 className="line-clamp-2 text-sm font-semibold text-white">{product.name}</h3>
            {product.urdu && <p className="text-xs text-white/50" dir="rtl">{product.urdu}</p>}
          </Link>
          <button
            onClick={() => toggleWishlist(product.id)}
            className={`rounded-full p-1.5 transition ${isInWishlist(product.id) ? "text-[var(--danger)]" : "text-white/40 hover:text-white"}`}
          >
            <Heart className={`h-4 w-4 ${isInWishlist(product.id) ? "fill-current" : ""}`} />
          </button>
        </div>

        <p className="mt-1 text-xs text-white/40">{product.category?.name} {product.unit && `• ${product.unit}`}</p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <div>
            <p className="text-base font-bold text-[var(--accent)]">{formatPrice(product.price)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-white/40 line-through">{formatPrice(product.originalPrice)}</p>
            )}
          </div>

          {cartItem ? (
            <div className="flex items-center gap-2 rounded-xl bg-black/30 p-1">
              <button onClick={() => updateQuantity(product.id, cartItem.quantity - 1)} className="rounded-lg p-1 hover:bg-white/10">
                {cartItem.quantity <= 1 ? <Trash2 className="h-3.5 w-3.5 text-[var(--danger)]" /> : <Minus className="h-3.5 w-3.5" />}
              </button>
              <span className="min-w-[1.2rem] text-center text-sm">{cartItem.quantity}</span>
              <button onClick={() => updateQuantity(product.id, cartItem.quantity + 1)} className="rounded-lg p-1 hover:bg-white/10">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product.id)}
              disabled={!product.stock}
              className="btn btn-primary rounded-full px-3 py-2"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
