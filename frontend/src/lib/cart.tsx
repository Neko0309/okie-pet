import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartItem {
  key: string;
  productId: string;
  variantId: string | null;
  name: string;
  nameEn: string | null;
  variantName: string | null;
  variantNameEn: string | null;
  price: number;
  image: string | null;
  quantity: number;
  /** Stock at the time this was added — quantity is clamped to this so the
   * cart can't ask for more than what's actually available. */
  maxQuantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (input: Omit<CartItem, "key" | "quantity">, qty?: number) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "okiepet_cart";

function itemKey(productId: string, variantId: string | null) {
  return `${productId}:${variantId ?? "base"}`;
}

function isValidItem(item: unknown): item is CartItem {
  if (!item || typeof item !== "object") return false;
  const i = item as Record<string, unknown>;
  return (
    typeof i.key === "string" &&
    typeof i.productId === "string" &&
    typeof i.name === "string" &&
    typeof i.price === "number" &&
    typeof i.quantity === "number" &&
    typeof i.maxQuantity === "number"
  );
}

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Drops items saved under an older shape of CartItem (e.g. before
    // maxQuantity existed) instead of crashing on them.
    return parsed.filter(isValidItem);
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(input: Omit<CartItem, "key" | "quantity">, qty = 1) {
    const key = itemKey(input.productId, input.variantId);
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        const max = Math.max(1, existing.maxQuantity);
        return prev.map((i) =>
          i.key === key
            ? { ...i, maxQuantity: input.maxQuantity, quantity: Math.min(i.quantity + qty, max) }
            : i,
        );
      }
      const max = Math.max(1, input.maxQuantity);
      return [...prev, { ...input, key, quantity: Math.min(qty, max) }];
    });
  }

  function updateQuantity(key: string, quantity: number) {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.key !== key);
      return prev.map((i) =>
        i.key === key
          ? { ...i, quantity: Math.min(quantity, Math.max(1, i.maxQuantity)) }
          : i,
      );
    });
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function clear() {
    setItems([]);
  }

  const count = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, count, subtotal, addItem, updateQuantity, removeItem, clear }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
