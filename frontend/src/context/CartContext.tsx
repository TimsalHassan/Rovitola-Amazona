import { createContext, useReducer, useCallback, type ReactNode } from "react";
import type { MenuItem, Extra } from "../api/menu";

// ─── Cart item shape ──────────────────────────────────────────────────────────

export interface SelectedOption {
  extra_id: number;
  extra_name: string;
  extra_name_fi: string;
  extra_type: Extra["extra_type"];
  option_id: number;
  option_name: string;
  option_name_fi: string;
  additional_price: number;
}

export interface CartItem {
  cartKey: string;
  menuItem: MenuItem;
  quantity: number;
  selectedOptions: SelectedOption[];
  unitPrice: number;
  totalPrice: number;
  specialInstruction: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
}

const STORAGE_KEY = "cart_v1";

function loadFromStorage(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    // Basic shape guard
    if (Array.isArray(parsed?.items)) return parsed;
  } catch {
    // corrupted — ignore
  }
  return { items: [] };
}

function saveToStorage(state: CartState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full or blocked — ignore
  }
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type CartAction =
  | {
      type: "ADD_ITEM";
      menuItem: MenuItem;
      selectedOptions: SelectedOption[];
      quantity: number;
      specialInstruction: string;
    }
  | { type: "REMOVE_ITEM"; cartKey: string }
  | { type: "UPDATE_QUANTITY"; cartKey: string; quantity: number }
  | { type: "UPDATE_INSTRUCTION"; cartKey: string; instruction: string }
  | { type: "CLEAR" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcUnitPrice(menuItem: MenuItem, selectedOptions: SelectedOption[]): number {
  const base = Number(menuItem.current_price) || 0;
  const extras = selectedOptions.reduce((sum, opt) => sum + opt.additional_price, 0);
  return base + extras;
}

function makeCartKey(menuItemId: number, selectedOptions: SelectedOption[]): string {
  const optIds = selectedOptions
    .map((o) => `${o.extra_id}-${o.option_id}`)
    .sort()
    .join("|");
  return `${menuItemId}::${optIds}`;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: CartState, action: CartAction): CartState {
  let next: CartState;

  switch (action.type) {
    case "ADD_ITEM": {
      const cartKey = makeCartKey(action.menuItem.id, action.selectedOptions);
      const unitPrice = calcUnitPrice(action.menuItem, action.selectedOptions);
      const existing = state.items.find((i) => i.cartKey === cartKey);

      if (existing) {
        next = {
          items: state.items.map((i) =>
            i.cartKey === cartKey
              ? {
                  ...i,
                  quantity: i.quantity + action.quantity,
                  totalPrice: unitPrice * (i.quantity + action.quantity),
                }
              : i,
          ),
        };
      } else {
        const newItem: CartItem = {
          cartKey,
          menuItem: action.menuItem,
          quantity: action.quantity,
          selectedOptions: action.selectedOptions,
          unitPrice,
          totalPrice: unitPrice * action.quantity,
          specialInstruction: action.specialInstruction,
        };
        next = { items: [...state.items, newItem] };
      }
      break;
    }

    case "REMOVE_ITEM":
      next = { items: state.items.filter((i) => i.cartKey !== action.cartKey) };
      break;

    case "UPDATE_QUANTITY": {
      if (action.quantity <= 0) {
        next = { items: state.items.filter((i) => i.cartKey !== action.cartKey) };
      } else {
        next = {
          items: state.items.map((i) =>
            i.cartKey === action.cartKey
              ? { ...i, quantity: action.quantity, totalPrice: i.unitPrice * action.quantity }
              : i,
          ),
        };
      }
      break;
    }

    case "UPDATE_INSTRUCTION":
      next = {
        items: state.items.map((i) =>
          i.cartKey === action.cartKey
            ? { ...i, specialInstruction: action.instruction }
            : i,
        ),
      };
      break;

    case "CLEAR":
      next = { items: [] };
      break;

    default:
      return state;
  }

  saveToStorage(next);
  return next;
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  addItem: (
    menuItem: MenuItem,
    selectedOptions: SelectedOption[],
    quantity: number,
    specialInstruction?: string,
  ) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  updateInstruction: (cartKey: string, instruction: string) => void;
  clearCart: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  // Load persisted state on first render
  const [state, dispatch] = useReducer(reducer, undefined, loadFromStorage);

  const addItem = useCallback(
    (
      menuItem: MenuItem,
      selectedOptions: SelectedOption[],
      quantity: number,
      specialInstruction = "",
    ) => {
      dispatch({ type: "ADD_ITEM", menuItem, selectedOptions, quantity, specialInstruction });
    },
    [],
  );

  const removeItem = useCallback(
    (cartKey: string) => dispatch({ type: "REMOVE_ITEM", cartKey }),
    [],
  );

  const updateQuantity = useCallback(
    (cartKey: string, quantity: number) =>
      dispatch({ type: "UPDATE_QUANTITY", cartKey, quantity }),
    [],
  );

  const updateInstruction = useCallback(
    (cartKey: string, instruction: string) =>
      dispatch({ type: "UPDATE_INSTRUCTION", cartKey, instruction }),
    [],
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const totalItems = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = state.items.reduce((s, i) => s + i.totalPrice, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        updateInstruction,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}