export function formatPrice(amount: number, currency = "PKR"): string {
  return `${currency} ${amount.toLocaleString("en-PK")}`;
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function calcDiscountPercent(price: number, original?: number | null) {
  if (!original || original <= price) return 0;
  return Math.round(((original - price) / original) * 100);
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, wait = 300) {
  let t: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
