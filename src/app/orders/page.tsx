"use client";

import { useEffect, useState } from "react";
import Shell from "@/components/Shell";
import { formatPrice } from "@/lib/utils";
import { Package, Clock, CheckCircle, XCircle } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  return (
    <Shell>
      <div className="mx-auto max-w-4xl px-4 pb-10">
        <h1 className="text-2xl font-bold text-white">Apke Orders</h1>
        {loading ? (
          <div className="mt-6 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-16 text-center text-white/60">Abhi tak koi order nahi.</div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="rounded-2xl glass p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[var(--accent)]" />
                    <span className="font-semibold">Order #{order.id}</span>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-xs text-white/40">{new Date(order.createdAt).toLocaleString("en-PK")}</p>
                <div className="mt-3 space-y-1 text-sm text-white/70">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{item.name} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between border-t border-white/10 pt-2">
                  <span className="text-sm text-white/60">Total</span>
                  <span className="font-bold text-[var(--accent)]">{formatPrice(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "delivered") return <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400"><CheckCircle className="h-3 w-3" /> Delivered</span>;
  if (status === "cancelled") return <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-1 text-xs text-red-400"><XCircle className="h-3 w-3" /> Cancelled</span>;
  return <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-1 text-xs text-yellow-400"><Clock className="h-3 w-3" /> Pending</span>;
}
