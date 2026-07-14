"use client";

import Link from "next/link";
import { Home, ClipboardList, Store, Package, Settings } from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home", icon: Home },
  { href: "/cart", label: "List", icon: ClipboardList },
  { href: "/shop", label: "Shop", icon: Store },
  { href: "/orders", label: "Orders", icon: Package },
  { href: "/admin-shahmeer-guptia", label: "Bons", icon: Settings },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass pb-safe lg:hidden">
      <div className="mx-auto flex max-w-md justify-around py-2">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs transition ${
                active ? "text-[var(--accent)]" : "text-white/60 hover:text-white"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
