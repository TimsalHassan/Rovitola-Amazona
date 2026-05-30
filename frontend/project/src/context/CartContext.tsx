import { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, MenuItem, ToppingSelection, SeasoningSelection, SIZE_PRICES } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (item: MenuItem, size: 'small' | 'medium' | 'large', toppings: ToppingSelection[], seasonings: SeasoningSelection[], quantity: number) => void;
  removeItem: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateItemPrice(item: MenuItem, size: 'small' | 'medium' | 'large', toppings: ToppingSelection[]): number {
  let price = item.price;
  price += SIZE_PRICES[size];
  price += toppings.reduce((sum, t) => sum + t.price, 0);
  return price;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: MenuItem, size: 'small' | 'medium' | 'large', toppings: ToppingSelection[], seasonings: SeasoningSelection[], quantity: number) => {
    const unitPrice = calculateItemPrice(item, size, toppings);
    const totalPrice = unitPrice * quantity;

    const cartItem: CartItem = {
      item,
      quantity,
      size,
      toppings,
      seasonings,
      totalPrice,
    };

    setItems(prev => [...prev, cartItem]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(index);
      return;
    }
    setItems(prev => prev.map((ci, i) => {
      if (i === index) {
        const unitPrice = calculateItemPrice(ci.item, ci.size, ci.toppings);
        return { ...ci, quantity, totalPrice: unitPrice * quantity };
      }
      return ci;
    }));
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, ci) => sum + ci.quantity, 0);
  const subtotal = items.reduce((sum, ci) => sum + ci.totalPrice, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
