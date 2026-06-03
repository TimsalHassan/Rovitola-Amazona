import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { CartProvider } from "./context/CartContext";
import { ProtectedRoute, RequireGuest } from "./components/ProtectedRoute";
import { AdminAuthProvider } from "./context/admin/AdminAuthContext";

import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import Navbar from "./components/Navbar";
import AuthLayout from "./components/AuthLayout";

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
import { MenuProvider } from "./context/MenuContext";
import MenuItemPage from "./pages/MenuItemPage";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminMenuPage from "./pages/admin/AdminMenuPage";
import AdminMenuFormPage from "./pages/admin/AdminMenuFormPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import Footer from "./components/Footer";

// Layout WITH navbar — used for all app pages
function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer/>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <MenuProvider>
        <CartProvider>
          <AuthProvider>
            <AdminAuthProvider>  {/* ← ADD */}
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
                    <Route path="/menu/:id" element={<MenuItemPage />} />
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

                    {/* ↓↓↓ ADMIN ROUTES — ADD THESE ↓↓↓ */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route
                      path="/admin/*"
                      element={
                        <AdminRoute>
                          <AdminLayout>
                            <Routes>
                              <Route path="dashboard" element={<AdminDashboardPage />} />
                              <Route path="orders" element={<AdminOrdersPage />} />
                              <Route path="menu" element={<AdminMenuPage />} />
                              <Route path="menu/new" element={<AdminMenuFormPage />} />
                              <Route path="menu/:id/edit" element={<AdminMenuFormPage />} />
                              <Route path="categories" element={<AdminCategoriesPage />} />
                              <Route path="users" element={<AdminUsersPage />} />
                            </Routes>
                          </AdminLayout>
                        </AdminRoute>
                      }
                    />
                    {/* ↑↑↑ ADMIN ROUTES END ↑↑↑ */}

                  </Route>
                </Routes>
              </BrowserRouter>
            </AdminAuthProvider>
          </AuthProvider>
        </CartProvider>
      </MenuProvider>
    </LanguageProvider>
  );
}
