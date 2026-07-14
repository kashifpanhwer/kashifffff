import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  quantity: number;
  addedAt: string;
}

interface AppState {
  cart: CartItem[];
  wishlist: number[];
  addToCart: (productId: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: number) => void;
  isInWishlist: (productId: number) => boolean;
  toast: { message: string; visible: boolean };
  showToast: (message: string) => void;
  hideToast: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],
      addToCart: (productId) => {
        set((state) => {
          const existing = state.cart.find((i) => i.productId === productId);
          const cart = existing
            ? state.cart.map((i) =>
                i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i
              )
            : [...state.cart, { productId, quantity: 1, addedAt: new Date().toISOString() }];
          return { cart };
        });
        get().showToast("Apka saman basket main add ho gaya");
      },
      removeFromCart: (productId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.productId !== productId) })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((i) => i.productId !== productId)
              : state.cart.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
        })),
      clearCart: () => set({ cart: [] }),
      toggleWishlist: (productId) =>
        set((state) => ({
          wishlist: state.wishlist.includes(productId)
            ? state.wishlist.filter((id) => id !== productId)
            : [...state.wishlist, productId],
        })),
      isInWishlist: (productId) => get().wishlist.includes(productId),
      toast: { message: "", visible: false },
      showToast: (message) => {
        set({ toast: { message, visible: true } });
        setTimeout(() => set({ toast: { message: "", visible: false } }), 2500);
      },
      hideToast: () => set({ toast: { message: "", visible: false } }),
    }),
    { name: "shahmeer-shop" }
  )
);

interface AdminState {
  loggedIn: boolean;
  setLoggedIn: (v: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  loggedIn: false,
  setLoggedIn: (v) => set({ loggedIn: v }),
}));
