"use client";

import { Phone, MapPin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[var(--bg-light)]/50 py-10 pb-28 lg:pb-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <h3 className="text-xl font-bold text-white">SHAHMEER SHOP</h3>
            <p className="mt-1 text-[var(--accent)]">شاہمیر شاپ</p>
            <p className="mt-3 text-sm text-white/70">
              Apki mohalle ki dukan. Daily essentials, groceries, snacks, beauty & household items at best prices in Mirpurkhas.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-white">Rabta Karen</h4>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--accent)]" /> Mirpurkhas, Sindh, Pakistan</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-[var(--accent)]" /> +92 319 2616627</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-[var(--accent)]" /> contact@shahmeershop.pk</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-white">WhatsApp Order</h4>
            <p className="mt-3 text-sm text-white/70">Apna order seedha WhatsApp par bhejein.</p>
            <a
              href="https://wa.me/923192616627"
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary mt-4 w-full md:w-auto"
            >
              WhatsApp Pe Order Karen
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Shahmeer Shop. All rights reserved. تمام حقوق محفوظ ہیں
        </div>
      </div>
    </footer>
  );
}
