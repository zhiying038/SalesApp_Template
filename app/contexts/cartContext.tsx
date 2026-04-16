import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, Cart } from "@/services/api";

type CartContextValue = {
  cart: Cart | null;
  isLoading: boolean;
  totalItems: number;
  getQuantity: (itemCode: string) => number;
  fetchCart: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchCart() {
    const res = await api.getCart();
    if (res.kind === "ok") setCart(res.result);
    setIsLoading(false);
  }

  useEffect(() => {
    fetchCart();
  }, []);

  function getQuantity(itemCode: string): number {
    return cart?.Items.find((i) => i.ItemCode === itemCode)?.Quantity ?? 0;
  }

  const totalItems = cart?.Items.length ?? 0;

  return (
    <CartContext.Provider value={{ cart, isLoading, totalItems, getQuantity, fetchCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
