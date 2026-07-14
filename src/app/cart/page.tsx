"use client";

import { useEffect, useMemo, useState } from "react";
import Shell from "@/components/Shell";
import { useAppStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Pencil, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const cart = useAppStore((s) => s.cart);
  const updateQuantity = useAppStore((s) => s.updateQuantity);
  const removeFromCart = useAppStore((s) => s.removeFromCart);
  const clearCart = useAppStore((s) => s.clearCart);
  const [products, setProducts] = useState<Record<number, any>>({});
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [discountError, setDiscountError] = useState("");
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const router = useRouter();
  const settings = { deliveryCharge: 50, freeDeliveryMin: 2000, whatsapp: "+92 319 2616627" };

  useEffect(() => {
    if (!cart.length) return;
    fetch(`/api/products?active=true`)
      .then((r) => r.json())
      .then((data: any[]) => {
        const map: Record<number, any> = {};
        data.forEach((p) => (map[p.id] = p));
        setProducts(map);
      });
  }, [cart]);

  const items = useMemo(() => cart.map((i) => ({ ...i, product: products[i.productId] })).filter((i) => i.product), [cart, products]);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const delivery = subtotal >= settings.freeDeliveryMin || subtotal === 0 ? 0 : settings.deliveryCharge;
  const total = Math.max(0, subtotal + delivery - discount);

  const applyDiscount = async () => {
    setDiscountError("");
    const res = await fetch(`/api/discount/validate?code=${encodeURIComponent(discountCode)}&subtotal=${subtotal}`);
    const data = await res.json();
    if (data.error) {
      setDiscountError(data.error);
      setDiscount(0);
    } else {
      setDiscount(data.discount);
    }
  };

  const checkout = async () => {
    if (!items.length) return;
    const orderItems = items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      price: i.product.price,
      quantity: i.quantity,
    }));
    const body = {
      customerName: customer.name,
      phone: customer.phone,
      address: customer.address,
      total,
      delivery,
      discount,
      items: orderItems,
      whatsappUrl: "",
    };
    const res = await fetch("/api/orders", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
    const order = await res.json();
    if (order.id) {
      const text = `*New Order #${order.id}*%0A%0A${items.map((i) => `- ${i.product.name} x${i.quantity} = ${formatPrice(i.product.price * i.quantity)}`).join("%0A")}%0A%0ASubtotal: ${formatPrice(subtotal)}%0ADelivery: ${formatPrice(delivery)}%0ADiscount: ${formatPrice(discount)}%0A*Total: ${formatPrice(total)}*%0A%0AName: ${customer.name || "N/A"}%0APhone: ${customer.phone || "N/A"}%0AAddress: ${customer.address || "N/A"}`;
      const url = `https://wa.me/923192616627?text=${text}`;
      clearCart();
      window.open(url, "_blank");
      router.push("/orders");
    }
  };

  return (
    <Shell>
      <div className="mx-auto max-w-7xl px-4 pb-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Apka Saman</h1>
          <button onClick={clearCart} className="text-sm text-[var(--danger)] hover:underline">Sara khali karein</button>
        </div>

        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <ShoppingBag className="h-16 w-16 text-white/20" />
            <p className="mt-4 text-lg text-white/60">Apki basket khali hai</p>
            <Link href="/shop" className="btn btn-primary mt-4">Shop Pe Jayen</Link>
          </div>
        ) : (
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="space-y-3 lg:col-span-2">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4 rounded-2xl glass p-3">
                  <Link href={`/product/${item.productId}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-white/5">
                    {item.product.image ? (
                      <Image src={item.product.image} alt={item.product.name} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">🛍️</div>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{item.product.name}</h3>
                      {item.product.urdu && <p className="text-xs text-white/50" dir="rtl">{item.product.urdu}</p>}
                      <p className="text-xs text-white/40">{item.addedAt.slice(0, 10)} • SKU {item.product.sku}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-xl bg-black/30 p-1">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="rounded-lg p-1 hover:bg-white/10"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="min-w-[1.5rem] text-center text-sm">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="rounded-lg p-1 hover:bg-white/10"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-[var(--accent)]">{formatPrice(item.product.price * item.quantity)}</span>
                        <button onClick={() => removeFromCart(item.productId)} className="rounded-lg bg-[var(--danger)]/20 p-2 text-[var(--danger)] hover:bg-[var(--danger)]/30">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="h-fit space-y-4 rounded-2xl glass p-5">
              <h2 className="text-lg font-bold text-white">Order Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-white/70"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-white/70"><span>Delivery</span><span>{delivery === 0 ? "Free" : formatPrice(delivery)}</span></div>
                {discount > 0 && <div className="flex justify-between text-[var(--accent)]"><span>Discount</span><span>-{formatPrice(discount)}</span></div>}
                <div className="flex justify-between border-t border-white/10 pt-2 text-lg font-bold text-white"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              <div>
                <label className="text-xs text-white/50">Discount Code Dale</label>
                <div className="mt-1 flex gap-2">
                  <input value={discountCode} onChange={(e) => setDiscountCode(e.target.value)} placeholder="SAVE100" className="flex-1" />
                  <button onClick={applyDiscount} className="btn border border-white/10 bg-white/5 text-sm hover:bg-white/10">Apply</button>
                </div>
                {discountError && <p className="mt-1 text-xs text-[var(--danger)]">{discountError}</p>}
              </div>

              <div className="space-y-2">
                <input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} placeholder="Apka naam" />
                <input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} placeholder="Phone number" />
                <textarea value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} placeholder="Address" rows={2} />
              </div>

              <button onClick={checkout} className="btn btn-primary w-full">
                Order Ab Karen <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
