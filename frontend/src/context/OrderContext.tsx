import {
  createContext,
  useCallback,
  useContext,
  useReducer,
  type ReactNode,
} from "react";
import { ordersApi, type Order } from "../api/order";

// ─── State ────────────────────────────────────────────────────────────────────

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  isLoading: boolean;
  isFetching: boolean; // background re-fetch (e.g. polling)
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  isLoading: false,
  isFetching: false,
  error: null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type OrderAction =
  | { type: "FETCH_LIST_START" }
  | { type: "FETCH_LIST_SUCCESS"; orders: Order[] }
  | { type: "FETCH_LIST_ERROR"; error: string }
  | { type: "FETCH_ONE_START" }
  | { type: "FETCH_ONE_BACKGROUND" }
  | { type: "FETCH_ONE_SUCCESS"; order: Order }
  | { type: "FETCH_ONE_ERROR"; error: string }
  | { type: "UPSERT_ORDER"; order: Order }
  | { type: "CLEAR_CURRENT" }
  | { type: "CLEAR_ERROR" };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: OrderState, action: OrderAction): OrderState {
  switch (action.type) {
    case "FETCH_LIST_START":
      return { ...state, isLoading: true, error: null };

    case "FETCH_LIST_SUCCESS":
      return {
        ...state,
        isLoading: false,
        orders: action.orders.sort(
          (a, b) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        ),
      };

    case "FETCH_LIST_ERROR":
      return { ...state, isLoading: false, error: action.error };

    case "FETCH_ONE_START":
      return { ...state, isLoading: true, error: null };

    case "FETCH_ONE_BACKGROUND":
      return { ...state, isFetching: true };

    case "FETCH_ONE_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isFetching: false,
        currentOrder: action.order,
        // Also keep the list fresh
        orders: state.orders.some((o) => o.id === action.order.id)
          ? state.orders.map((o) =>
              o.id === action.order.id ? action.order : o,
            )
          : state.orders,
      };

    case "FETCH_ONE_ERROR":
      return {
        ...state,
        isLoading: false,
        isFetching: false,
        error: action.error,
      };

    case "UPSERT_ORDER": {
      const exists = state.orders.some((o) => o.id === action.order.id);
      return {
        ...state,
        currentOrder:
          state.currentOrder?.id === action.order.id
            ? action.order
            : state.currentOrder,
        orders: exists
          ? state.orders.map((o) =>
              o.id === action.order.id ? action.order : o,
            )
          : [action.order, ...state.orders],
      };
    }

    case "CLEAR_CURRENT":
      return { ...state, currentOrder: null };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

// ─── Context value ────────────────────────────────────────────────────────────

export interface OrderContextValue extends OrderState {
  /** Fetch the full orders list (for My Orders page) */
  fetchOrders: (params?: {
    guest_phone?: string;
    guest_email?: string;
  }) => Promise<void>;
  /** Fetch a single order by order_number (shows loading spinner) */
  fetchOrder: (orderNumber: string) => Promise<void>;
  /** Re-fetch a single order silently (no loading spinner, for polling) */
  refreshOrder: (orderNumber: string) => Promise<void>;
  /** Manually insert / update an order in state (e.g. right after creation) */
  upsertOrder: (order: Order) => void;
  /** Clear the current order (e.g. when leaving the tracking page) */
  clearCurrentOrder: () => void;
  clearError: () => void;
}

export const OrderContext = createContext<OrderContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function OrderProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchOrders = useCallback(
    async (params?: { guest_phone?: string; guest_email?: string }) => {
      dispatch({ type: "FETCH_LIST_START" });
      try {
        const orders = await ordersApi.list(params);
        dispatch({ type: "FETCH_LIST_SUCCESS", orders });
      } catch (err) {
        dispatch({
          type: "FETCH_LIST_ERROR",
          error: err instanceof Error ? err.message : "Failed to load orders",
        });
      }
    },
    [],
  );

  const fetchOrder = useCallback(async (orderNumber: string) => {
    dispatch({ type: "FETCH_ONE_START" });
    try {
      const order = await ordersApi.getByNumber(orderNumber);
      dispatch({ type: "FETCH_ONE_SUCCESS", order });
    } catch (err) {
      dispatch({
        type: "FETCH_ONE_ERROR",
        error: err instanceof Error ? err.message : "Failed to load order",
      });
    }
  }, []);

  const refreshOrder = useCallback(async (orderNumber: string) => {
    dispatch({ type: "FETCH_ONE_BACKGROUND" });
    try {
      const order = await ordersApi.getByNumber(orderNumber);
      dispatch({ type: "FETCH_ONE_SUCCESS", order });
    } catch {
      // Silently fail on background refresh — don't show error to user
      dispatch({ type: "FETCH_ONE_BACKGROUND" }); // reset isFetching
    }
  }, []);

  const upsertOrder = useCallback((order: Order) => {
    dispatch({ type: "UPSERT_ORDER", order });
  }, []);

  const clearCurrentOrder = useCallback(() => {
    dispatch({ type: "CLEAR_CURRENT" });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: "CLEAR_ERROR" });
  }, []);

  return (
    <OrderContext.Provider
      value={{
        ...state,
        fetchOrders,
        fetchOrder,
        refreshOrder,
        upsertOrder,
        clearCurrentOrder,
        clearError,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useOrders(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be used inside <OrderProvider>");
  return ctx;
}