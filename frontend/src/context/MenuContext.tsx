import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  type ReactNode,
} from "react";
import { menuApi, type Category, type MenuItem, type Extra } from "../api/menu";
import { useLanguage } from "../hooks/useLanguage";

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

export interface MenuContextValue extends MenuState {
  fetchCategories: () => Promise<void>;
  fetchItems: (params?: { category?: string; is_lunch_item?: boolean; is_available?: boolean }) => Promise<void>;
  fetchExtras: (params?: { category?: string }) => Promise<void>;
  // category_slug not in ExtraSerializer — filter by category id instead
  getItemsByCategory: (categorySlug: string) => MenuItem[];
  getExtrasByCategory: (categoryId: number) => Extra[];
  clearError: () => void;
}

export const MenuContext = createContext<MenuContextValue | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { language } = useLanguage();

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
      dispatch({
        type: "FETCH_ERROR",
        error: err instanceof Error ? err.message : "Failed to load categories",
      });
    }
  }, [language]);

 const fetchItems = useCallback(async (
  params?: { category?: string; is_lunch_item?: boolean; is_available?: boolean }
) => {
  dispatch({ type: "FETCH_ITEMS_START" });
  try {
    // Fetch first page to get total count
    const first = await menuApi.getItemsPaginated({ ...params, language, page: 1, page_size: 100 });
    const allItems = [...first.results];

    // If there are more pages, fetch them in parallel
    if (first.count > allItems.length) {
      const totalPages = Math.ceil(first.count / 100);
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          menuApi.getItemsPaginated({ ...params, language, page: i + 2, page_size: 100 })
        )
      );
      rest.forEach((page) => allItems.push(...page.results));
    }

    dispatch({ type: "FETCH_ITEMS_SUCCESS", items: allItems });
  } catch (err) {
    dispatch({
      type: "FETCH_ERROR",
      error: err instanceof Error ? err.message : "Failed to load menu items",
    });
  }
}, [language]);

  const fetchExtras = useCallback(async (params?: { category?: string }) => {
    try {
      const extras = await menuApi.getExtras({ ...params, language });
      dispatch({ type: "FETCH_EXTRAS_SUCCESS", extras });
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        error: err instanceof Error ? err.message : "Failed to load extras",
      });
    }
  }, [language]);

  const getItemsByCategory = useCallback(
    (categorySlug: string) =>
      state.items.filter((item) => item.category_slug === categorySlug),
    [state.items],
  );

  // FIX: Extra has no category_slug — filter by category id
  const getExtrasByCategory = useCallback(
    (categoryId: number) =>
      state.extras.filter((extra) => extra.category === categoryId),
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