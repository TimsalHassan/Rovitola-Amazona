import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useContext,
  type ReactNode,
} from "react";
import {
  restaurantApi,
  type RestaurantInfo,
  type DeliveryCheckPayload,
  type DeliveryCheckResponse,
} from "../api/restaurant";

// ─── State ────────────────────────────────────────────────────────────────────

interface RestaurantState {
  info: RestaurantInfo | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: RestaurantState = {
  info: null,
  isLoading: true,
  error: null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type RestaurantAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; info: RestaurantInfo }
  | { type: "FETCH_ERROR"; error: string };

function reducer(
  state: RestaurantState,
  action: RestaurantAction
): RestaurantState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };
    case "FETCH_SUCCESS":
      return { info: action.info, isLoading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, isLoading: false, error: action.error };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

export interface RestaurantContextValue extends RestaurantState {
  refetch: () => Promise<void>;
  checkDelivery: (payload: DeliveryCheckPayload) => Promise<DeliveryCheckResponse>;
  // Convenience getters
  isOpen: boolean;
  openStatusMessage: string;
  deliveryFee: number;
  freeDeliveryRadius: number;
  paidDeliveryRadius: number;
  minOrder: number;
  isDeliveryEnabled: boolean;
}

export const RestaurantContext = createContext<RestaurantContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchInfo = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const info = await restaurantApi.getInfo();
      dispatch({ type: "FETCH_SUCCESS", info });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        error: err instanceof Error ? err.message : "Failed to load restaurant info",
      });
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const checkDelivery = useCallback(async (payload: DeliveryCheckPayload) => {
    return restaurantApi.checkDelivery(payload);
  }, []);

  // Convenience computed values — safe defaults when info hasn't loaded yet
  const isOpen             = state.info?.is_open_now ?? false;
  const openStatusMessage  = state.info?.open_status_message ?? "";
  const deliveryFee        = parseFloat(state.info?.delivery_fee ?? "0");
  const minOrder           = parseFloat(state.info?.min_order ?? "0");
  const isDeliveryEnabled  = state.info?.is_delivery_enabled ?? false;
  const freeDeliveryRadius = state.info?.free_delivery_radius_km ?? 0;
  const paidDeliveryRadius = state.info?.paid_delivery_radius_km ?? 0;

  return (
    <RestaurantContext.Provider
      value={{
        ...state,
        refetch: fetchInfo,
        checkDelivery,
        isOpen,
        openStatusMessage,
        deliveryFee,
        minOrder,
        isDeliveryEnabled,
        freeDeliveryRadius,
        paidDeliveryRadius,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useRestaurant() {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error("useRestaurant must be used inside RestaurantProvider");
  return ctx;
}