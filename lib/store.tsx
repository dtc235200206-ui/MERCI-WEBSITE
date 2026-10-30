"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "./data";

type Item = { product: Product; qty: number };
type Ctx = {
  cart: Item[]; add: (p: Product) => void; remove: (id: string) => void;
  count: number; total: number; cartOpen: boolean; setCartOpen: (v: boolean) => void;
  settingsOpen: boolean; setSettingsOpen: (v: boolean) => void;
  dark: boolean; setDark: (v: boolean) => void;
};
const C = createContext<Ctx>(null as never);
export const useStore = () => useContext(C);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Item[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const add = (p: Product) => setCart((c) => c.find((i) => i.product.id === p.id)
    ? c.map((i) => i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...c, { product: p, qty: 1 }]);
  const remove = (id: string) => setCart((c) => c.filter((i) => i.product.id !== id));
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.product.price, 0);
  return (
    <C.Provider value={{ cart, add, remove, count, total, cartOpen, setCartOpen, settingsOpen, setSettingsOpen, dark, setDark }}>
      <div className={dark ? "dark" : ""}>{children}</div>
    </C.Provider>
  );
}