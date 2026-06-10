import { create } from "zustand";
import type { CartItem, PaymentMethod } from "../types/sale.types";

interface CartState {
  items: CartItem[];
  discount: number;
  paymentMethod: PaymentMethod;
  addItem: (item: CartItem) => void;
  removeItem: (drugId: string) => void;
  updateQty: (drugId: string, qty: number) => void;
  setDiscount: (discount: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  paymentMethod: "cash",
  addItem: (item) =>
    set((s) => {
      const exists = s.items.find((i) => i.drugId === item.drugId);
      if (exists) {
        return {
          items: s.items.map((i) =>
            i.drugId === item.drugId
              ? { ...i, quantity: i.quantity + item.quantity, subtotal: (i.quantity + item.quantity) * i.unitPrice }
              : i
          ),
        };
      }
      return { items: [...s.items, item] };
    }),
  removeItem: (drugId) =>
    set((s) => ({ items: s.items.filter((i) => i.drugId !== drugId) })),
  updateQty: (drugId, qty) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.drugId === drugId ? { ...i, quantity: qty, subtotal: qty * i.unitPrice } : i
      ),
    })),
  setDiscount: (discount) => set({ discount }),
  setPaymentMethod: (paymentMethod) => set({ paymentMethod }),
  clearCart: () => set({ items: [], discount: 0, paymentMethod: "cash" }),
  total: () => {
    const { items, discount } = get();
    const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);
    return subtotal - discount;
  },
}));
