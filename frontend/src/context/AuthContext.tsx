import {
  createContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import { authApi, addressApi, type User, type Address } from "../api/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  addresses: Address[];
  isLoading: boolean; // initial hydration
  isAuthenticated: boolean;
}

type AuthAction =
  | { type: "HYDRATE_START" }
  | { type: "HYDRATE_SUCCESS"; user: User; token: string; addresses: Address[] }
  | { type: "HYDRATE_FAIL" }
  | { type: "LOGIN_SUCCESS"; user: User; token: string }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; user: User }
  | { type: "SET_ADDRESSES"; addresses: Address[] }
  | { type: "ADD_ADDRESS"; address: Address }
  | { type: "UPDATE_ADDRESS"; address: Address }
  | { type: "DELETE_ADDRESS"; id: number }
  | { type: "SET_DEFAULT_ADDRESS"; id: number };

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "HYDRATE_START":
      return { ...state, isLoading: true };

    case "HYDRATE_SUCCESS":
      return {
        ...state,
        user: action.user,
        token: action.token,
        addresses: action.addresses,
        isLoading: false,
        isAuthenticated: true,
      };

    case "HYDRATE_FAIL":
      return { ...initialState, isLoading: false };

    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.user,
        token: action.token,
        isAuthenticated: true,
      };

    case "LOGOUT":
      return { ...initialState, isLoading: false };

    case "UPDATE_USER":
      return { ...state, user: action.user };

    case "SET_ADDRESSES":
      return { ...state, addresses: action.addresses };

    case "ADD_ADDRESS":
      return {
        ...state,
        addresses: [...state.addresses, action.address].sort(sortAddresses),
      };

    case "UPDATE_ADDRESS":
      return {
        ...state,
        addresses: state.addresses
          .map((a) => (a.id === action.address.id ? action.address : a))
          .sort(sortAddresses),
      };

    case "DELETE_ADDRESS":
      return {
        ...state,
        addresses: state.addresses.filter((a) => a.id !== action.id),
      };

    case "SET_DEFAULT_ADDRESS":
      return {
        ...state,
        addresses: state.addresses
          .map((a) => ({ ...a, is_default: a.id === action.id }))
          .sort(sortAddresses),
      };

    default:
      return state;
  }
}

function sortAddresses(a: Address, b: Address) {
  if (a.is_default !== b.is_default) return a.is_default ? -1 : 1;
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

const initialState: AuthState = {
  user: null,
  token: null,
  addresses: [],
  isLoading: true,
  isAuthenticated: false,
};


export interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { name?: string; phone?: string }) => Promise<void>;
  changePassword: (data: {
    current_password: string;
    new_password: string;
  }) => Promise<void>;
  // Addresses
  fetchAddresses: () => Promise<void>;
  addAddress: (data: Omit<Address, "id" | "created_at">) => Promise<void>;
  updateAddress: (
    id: number,
    data: Partial<Omit<Address, "id" | "created_at">>,
  ) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
  setDefaultAddress: (id: number) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

const TOKEN_KEY = "access_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const tokenRef = useRef<string | null>(null);

  tokenRef.current = state.token;

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      dispatch({ type: "HYDRATE_FAIL" });
      return;
    }

    dispatch({ type: "HYDRATE_START" });

    Promise.all([authApi.getProfile(stored), addressApi.list(stored)])
      .then(([user, addresses]) => {
        dispatch({ type: "HYDRATE_SUCCESS", user, token: stored, addresses });
      })
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        dispatch({ type: "HYDRATE_FAIL" });
      });
  }, []);


  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await authApi.login({ email, password });
    localStorage.setItem(TOKEN_KEY, token);
    dispatch({ type: "LOGIN_SUCCESS", user, token });
    // Load addresses after login (non-blocking to keep login fast)
    addressApi.list(token).then((addresses) => {
      dispatch({ type: "SET_ADDRESSES", addresses });
    });
  }, []);

  const register = useCallback(
    async (data: {
      name: string;
      email: string;
      phone: string;
      password: string;
    }) => {
      const { token, user } = await authApi.register(data);
      localStorage.setItem(TOKEN_KEY, token);
      dispatch({ type: "LOGIN_SUCCESS", user, token });
    },
    [],
  );

  const logout = useCallback(async () => {
    const token = tokenRef.current;
    localStorage.removeItem(TOKEN_KEY);
    dispatch({ type: "LOGOUT" });
    if (token) authApi.logout(token).catch(() => {});
  }, []);

  const updateProfile = useCallback(
    async (data: { name?: string; phone?: string }) => {
      const token = tokenRef.current!;
      if (state.user) {
        dispatch({
          type: "UPDATE_USER",
          user: { ...state.user, ...data },
        });
      }
      try {
        const updated = await authApi.updateProfile(token, data);
        dispatch({ type: "UPDATE_USER", user: updated });
      } catch (err) {
        // Rollback
        if (state.user) dispatch({ type: "UPDATE_USER", user: state.user });
        throw err;
      }
    },
    [state.user],
  );

  const changePassword = useCallback(
    async (data: { current_password: string; new_password: string }) => {
      const token = tokenRef.current!;
      await authApi.changePassword(token, data);
    },
    [],
  );

  const fetchAddresses = useCallback(async () => {
    const token = tokenRef.current!;
    const addresses = await addressApi.list(token);
    dispatch({ type: "SET_ADDRESSES", addresses });
  }, []);

  const addAddress = useCallback(
    async (data: Omit<Address, "id" | "created_at">) => {
      const token = tokenRef.current!;
      const tempId = -Date.now();
      const optimistic: Address = {
        ...data,
        id: tempId,
        created_at: new Date().toISOString(),
      };
      dispatch({ type: "ADD_ADDRESS", address: optimistic });

      try {
        const real = await addressApi.create(token, data);
        dispatch({ type: "DELETE_ADDRESS", id: tempId });
        dispatch({ type: "ADD_ADDRESS", address: real });
        if (real.is_default) {
          dispatch({ type: "SET_DEFAULT_ADDRESS", id: real.id });
        }
      } catch (err) {
        dispatch({ type: "DELETE_ADDRESS", id: tempId });
        throw err;
      }
    },
    [],
  );

  const updateAddress = useCallback(
    async (id: number, data: Partial<Omit<Address, "id" | "created_at">>) => {
      const token = tokenRef.current!;
      const prev = state.addresses.find((a) => a.id === id);
      if (!prev) return;

      // Optimistic
      dispatch({ type: "UPDATE_ADDRESS", address: { ...prev, ...data } });

      try {
        const updated = await addressApi.update(token, id, data);
        dispatch({ type: "UPDATE_ADDRESS", address: updated });
        if (updated.is_default) {
          dispatch({ type: "SET_DEFAULT_ADDRESS", id: updated.id });
        }
      } catch (err) {
        dispatch({ type: "UPDATE_ADDRESS", address: prev });
        throw err;
      }
    },
    [state.addresses],
  );

  const deleteAddress = useCallback(
    async (id: number) => {
      const token = tokenRef.current!;
      const prev = state.addresses.find((a) => a.id === id);

      // Optimistic
      dispatch({ type: "DELETE_ADDRESS", id });

      try {
        await addressApi.delete(token, id);
      } catch (err) {
        // Rollback
        if (prev) dispatch({ type: "ADD_ADDRESS", address: prev });
        throw err;
      }
    },
    [state.addresses],
  );

  const setDefaultAddress = useCallback(
    async (id: number) => {
      const token = tokenRef.current!;
      const prevDefault = state.addresses.find((a) => a.is_default);

      dispatch({ type: "SET_DEFAULT_ADDRESS", id });

      try {
        await addressApi.setDefault(token, id);
      } catch (err) {
        if (prevDefault)
          dispatch({ type: "SET_DEFAULT_ADDRESS", id: prevDefault.id });
        throw err;
      }
    },
    [state.addresses],
  );

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
