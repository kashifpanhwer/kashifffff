"use client";

import Link from "next/link";
import { Search, Heart, ShoppingCart, User, Menu, MessageCircle } from "lucide-react";
import { useAppStore } from "@/lib/store";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const cart = useAppStore((s) => s.cart);
  const wishlist = useAppStore((s) => s.wishlist);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/offers", label: "Offers" },
    { href: "/cart", label: "Cart" },
    { href: "/admin-shahmeer-guptia", label: "Admin" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <button className="rounded-lg p-2 hover:bg-white/10 lg:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="flex flex-col items-center leading-none">
          <span className="text-lg font-bold tracking-tight text-white">SHAHMEER</span>
          <span className="text-[10px] font-medium text-[var(--accent)]">شاہمیر شاپ</span>
        </Link>

        <form onSubmit={onSearch} className="hidden flex-1 px-8 lg:block">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Saman dhundo..."
              className="w-full rounded-full border border-white/10 bg-black/20 py-2 pl-10 pr-4 text-sm text-white placeholder:text-white/40"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
          </div>
        </form>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/923192616627"
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-green-600 p-2 text-white hover:bg-green-500"
            title="WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <Link href="/orders" className="relative rounded-full p-2 hover:bg-white/10">
            <User className="h-5 w-5" />
          </Link>
          <Link href="/shop?wishlist=1" className="relative rounded-full p-2 hover:bg-white/10">
            <Heart className="h-5 w-5" />
            {wishlist.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--danger)] text-[10px] font-bold">
                {wishlist.length}
              </span>
            )}
          </Link>
          <Link href="/cart" className="relative rounded-full p-2 hover:bg-white/10">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] font-bold text-[var(--bg)]">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 px-4 py-3 lg:hidden">
          <ul className="space-y-2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm ${pathname === link.href ? "bg-[var(--accent)] text-[var(--bg)]" : "hover:bg-white/10"}`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
