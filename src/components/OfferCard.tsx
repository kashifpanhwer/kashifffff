"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export default function OfferCard({ offer }: { offer: any }) {
  return (
    <div className="relative overflow-hidden rounded-3xl glass">
      <div className="relative aspect-[16/10]">
        {offer.image ? (
          <Image src={offer.image} alt={offer.name} fill className="object-cover" sizes="100vw" />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--accent)]/20 to-[var(--secondary)]/20 text-6xl">🎁</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-5">
          <span className="rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-[var(--bg)]">{offer.discount}% OFF</span>
          <h3 className="mt-2 text-2xl font-bold text-white">{offer.name}</h3>
          {offer.urdu && <p className="text-sm text-white/70" dir="rtl">{offer.urdu}</p>}
          <p className="mt-1 text-sm text-white/70">{offer.description}</p>
          <Link
            href={`/offers`}
            className="btn btn-primary mt-4 w-fit text-sm"
          >
            Abhi Dekhen <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
