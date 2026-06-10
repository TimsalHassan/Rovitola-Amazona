import {
  createContext,
  useReducer,
  useCallback,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import {
  cartApi,
  type Cart,
  type CartItem,
  type AddToCartPayload,
} from "../api/cart";

// ─── State ────────────────────────────────────────────────────────────────────

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  isLoading: true,
  error: null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type CartAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; cart: Cart }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "CLEAR_ERROR" };

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { cart: action.cart, isLoading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.error };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

// ─── Context value ────────────────────────────────────────────────────────────

export interface CartContextValue {
  cart: Cart | null;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isLoading: boolean;
  error: string | null;
  fetchCart: () => Promise<void>;
  addItem: (payload: AddToCartPayload) => Promise<void>;
  updateItem: (
    id: number,
    payload: { quantity: number; special_instruction?: string; selected_option_ids?: number[] },
  ) => Promise<void>;
  removeItem: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  mergeCart: () => Promise<void>;
  clearError: () => void;
}

export const CartContext = createContext<CartContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetchingRef = useRef(false);

  // ── Fetch on mount ───────────────────────────────────────────────────────────

  const fetchCart = useCallback(async () => {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    dispatch({ type: "FETCH_START" });
    try {
      const cart = await cartApi.get();
      dispatch({ type: "FETCH_SUCCESS", cart });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        error: err instanceof Error ? err.message : "Failed to load cart",
      });
    } finally {
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ── Mutation helper ──────────────────────────────────────────────────────────

  async function mutate(fn: () => Promise<Cart>): Promise<void> {
    try {
      const cart = await fn();
      dispatch({ type: "FETCH_SUCCESS", cart });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        error: err instanceof Error ? err.message : "Cart operation failed",
      });
      throw err;
    }
  }

  // ── Actions ──────────────────────────────────────────────────────────────────

  const addItem = useCallback(
    (payload: AddToCartPayload) => mutate(() => cartApi.addItem(payload)),
    [],
  );

  const updateItem = useCallback(
    (
      id: number,
      payload: { quantity: number; special_instruction?: string; selected_option_ids?: number[] },
    ) => mutate(() => cartApi.updateItem(id, payload)),
    [],
  );

  const removeItem = useCallback(
    (id: number) => mutate(() => cartApi.removeItem(id)),
    [],
  );

  const clearCart = useCallback(async () => {
    try {
      // Pehle optimistically UI clear karo — delay nahi lagega
      dispatch({ type: "FETCH_SUCCESS", cart: { items: [], total_items: 0, subtotal: "0.00" } as any });
      // Phir backend call karo background mein
      await cartApi.clear();
    } catch (err) {
      // Silent fail — cart already clear dikha raha hai UI mein
      console.error("Cart clear failed:", err);
    }
  }, []);

  const mergeCart = useCallback(
    () => mutate(() => cartApi.merge()),
    [],
  );

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  // ── Derived ──────────────────────────────────────────────────────────────────

  const items = state.cart?.items ?? [];
  const totalItems = state.cart?.total_items ?? 0;
  const subtotal = parseFloat(state.cart?.subtotal ?? "0");

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        items,
        totalItems,
        subtotal,
        isLoading: state.isLoading,
        error: state.error,
        fetchCart,
        addItem,
        updateItem,
        removeItem,
        clearCart,
        mergeCart,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}
