import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { menuApi, type Category, type MenuItem, type Extra } from "../api/menu";
import { useLanguage } from "../hooks/useLanguage";

// ─── State ────────────────────────────────────────────────────────────────────

interface MenuState {
  categories: Category[];
  items: MenuItem[];
  extras: Extra[];
  isLoading: boolean;
  isItemsLoading: boolean;
  error: string | null;
}

const initialState: MenuState = {
  categories: [],
  items: [],
  extras: [],
  isLoading: false,
  isItemsLoading: false,
  error: null,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type MenuAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_CATEGORIES_SUCCESS"; categories: Category[] }
  | { type: "FETCH_ITEMS_START" }
  | { type: "FETCH_ITEMS_SUCCESS"; items: MenuItem[] }
  | { type: "FETCH_EXTRAS_SUCCESS"; extras: Extra[] }
  | { type: "FETCH_ERROR"; error: string }
  | { type: "CLEAR_ERROR" };

function reducer(state: MenuState, action: MenuAction): MenuState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, isLoading: true, error: null };

    case "FETCH_CATEGORIES_SUCCESS":
      return { ...state, isLoading: false, categories: action.categories };

    case "FETCH_ITEMS_START":
      return { ...state, isItemsLoading: true, error: null };

    case "FETCH_ITEMS_SUCCESS":
      return { ...state, isItemsLoading: false, items: action.items };

    case "FETCH_EXTRAS_SUCCESS":
      return { ...state, extras: action.extras };

    case "FETCH_ERROR":
      return { ...state, isLoading: false, isItemsLoading: false, error: action.error };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    default:
      return state;
  }
}

// ─── Context value ────────────────────────────────────────────────────────────

export interface MenuContextValue extends MenuState {
  fetchCategories: () => Promise<void>;
  fetchItems: (params?: { category?: string; is_lunch_item?: boolean; is_available?: boolean }) => Promise<void>;
  fetchExtras: (params?: { category?: string }) => Promise<void>;
  getItemsByCategory: (categorySlug: string) => MenuItem[];
  getExtrasByCategory: (categorySlug: string) => Extra[];
  clearError: () => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MenuProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { language } = useLanguage();

  // Re-fetch whenever language changes so the API returns the right locale
  useEffect(() => {
    fetchCategories();
    fetchItems();
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCategories = useCallback(async () => {
    dispatch({ type: "FETCH_START" });
    try {
      const categories = await menuApi.getCategories(language);
      dispatch({ type: "FETCH_CATEGORIES_SUCCESS", categories });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", error: err instanceof Error ? err.message : "Failed to load categories" });
    }
  }, [language]);

  const fetchItems = useCallback(async (
    params?: { category?: string; is_lunch_item?: boolean; is_available?: boolean }
  ) => {
    dispatch({ type: "FETCH_ITEMS_START" });
    try {
      const items = await menuApi.getItems({ ...params, language });
      dispatch({ type: "FETCH_ITEMS_SUCCESS", items });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", error: err instanceof Error ? err.message : "Failed to load menu items" });
    }
  }, [language]);

  const fetchExtras = useCallback(async (params?: { category?: string }) => {
    try {
      const extras = await menuApi.getExtras({ ...params, language });
      dispatch({ type: "FETCH_EXTRAS_SUCCESS", extras });
    } catch (err) {
      dispatch({ type: "FETCH_ERROR", error: err instanceof Error ? err.message : "Failed to load extras" });
    }
  }, [language]);

  // ── Derived selectors ──────────────────────────────────────────────────────

  const getItemsByCategory = useCallback(
    (categorySlug: string) => state.items.filter((item) => item.category_slug === categorySlug),
    [state.items],
  );

  const getExtrasByCategory = useCallback(
    (categorySlug: string) => state.extras.filter((extra) => extra.category_slug === categorySlug),
    [state.extras],
  );

  const clearError = useCallback(() => dispatch({ type: "CLEAR_ERROR" }), []);

  return (
    <MenuContext.Provider
      value={{
        ...state,
        fetchCategories,
        fetchItems,
        fetchExtras,
        getItemsByCategory,
        getExtrasByCategory,
        clearError,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}