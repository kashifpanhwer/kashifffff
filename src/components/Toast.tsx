"use client";

import { useAppStore } from "@/lib/store";
import { CheckCircle2 } from "lucide-react";

export default function Toast() {
  const { message, visible } = useAppStore((s) => s.toast);
  if (!visible) return null;
  return (
    <div className="fixed left-1/2 top-24 z-[60] -translate-x-1/2 animate-fade-in rounded-2xl border border-white/10 bg-[var(--bg-light)] px-5 py-3 shadow-2xl">
      <div className="flex items-center gap-3 text-sm font-medium text-white">
        <CheckCircle2 className="h-5 w-5 text-[var(--accent)]" />
        {message}
      </div>
    </div>
  );
}
