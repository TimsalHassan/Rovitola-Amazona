import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { ProtectedRoute, RequireGuest } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import MenuPage from "./pages/MenuPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmedPage from "./pages/OrderConfirmedPage";
import ContactPage from "./pages/ContactPage";
import AboutPage from "./pages/AboutPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AccountPage from "./pages/AccountPage";
import MyOrdersPage from "./pages/MyOrdersPage";

// Layout WITH navbar — used for all app pages
function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

// Layout WITHOUT navbar — used for login/register
function AuthLayout() {
  return <Outlet />;
}

export default function App() {
  return (
    <LanguageProvider>
      <CartProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>

              {/* Auth pages — no navbar */}
              <Route element={<AuthLayout />}>
                <Route
                  path="/login"
                  element={
                    <RequireGuest>
                      <LoginPage />
                    </RequireGuest>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <RequireGuest>
                      <RegisterPage />
                    </RequireGuest>
                  }
                />
              </Route>

              {/* App pages — with navbar */}
              <Route element={<AppLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <CheckoutPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmed"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmedPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/my-orders"
                  element={
                    <ProtectedRoute>
                      <MyOrdersPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </CartProvider>
    </LanguageProvider>
  );
}