"use client";
import { create } from "zustand";

type CartItem = { sku: string; name: string; price: number; quantity: number };

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (sku: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  add: (item) => set((state) => {
    const existing = state.items.find((i) => i.sku === item.sku);
    if (existing) {
      return { items: state.items.map((i) => i.sku === item.sku ? { ...i, quantity: i.quantity + 1 } : i) };
    }
    return { items: [...state.items, { ...item, quantity: 1 }] };
  }),
  remove: (sku) => set((state) => ({ items: state.items.filter((i) => i.sku !== sku) })),
  clear: () => set({ items: [] }),
}));