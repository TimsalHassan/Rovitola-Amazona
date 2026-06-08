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

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminMenuPage from "./pages/admin/AdminMenuPage";
import AdminMenuFormPage from "./pages/admin/AdminMenuFormPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminReviewsPage from "./pages/admin/AdminReviewsPage";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";
import AdminRestaurantPage from "./pages/admin/AdminRestaurantPage";

import Footer from "./components/Footer";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { RestaurantProvider } from "./context/RestaurantContext";
import { OrderProvider } from "./context/OrderContext";
import OrderTrackingPage from "./pages/OrderTrackingPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPasswordPage from "./pages/ResetPassword";

function AppLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <RestaurantProvider>
        <MenuProvider>
          <OrderProvider>
            <CartProvider>
              <AuthProvider>
                <AdminAuthProvider>
                  <BrowserRouter>
                    <Routes>
                      {/* Auth pages - no navbar */}
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
                        <Route
                          path="/verify-email"
                          element={
                            <RequireGuest>
                              <VerifyEmailPage />
                            </RequireGuest>
                          }
                        />
                        <Route
                          path="/verify-email/:uid/:token"
                          element={
                            <RequireGuest>
                              <VerifyEmailPage />
                            </RequireGuest>
                          }
                        />
                        <Route
                          path="/forgot-password"
                          element={
                            <RequireGuest>
                              <ForgotPassword />
                            </RequireGuest>
                          }
                        />
                        <Route
                          path="/reset-password/:uid/:token"
                          element={
                            <RequireGuest>
                              <ResetPasswordPage />
                            </RequireGuest>
                          }
                        />
                      </Route>

                      {/* App pages - with navbar */}
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
                          path="/confirm/order/:orderId"
                          element={
                            <ProtectedRoute>
                              <OrderConfirmationPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/order/:orderId"
                          element={
                            <ProtectedRoute>
                              <OrderConfirmedPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/order/:orderId/track"
                          element={
                            <ProtectedRoute>
                              <OrderTrackingPage />
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

                      {/* Admin routes */}
                      <Route path="/admin/login" element={<AdminLoginPage />} />
                      <Route
                        path="/admin/*"
                        element={
                          <AdminRoute>
                            <AdminLayout>
                              <Routes>
                                <Route
                                  path="dashboard"
                                  element={<AdminDashboardPage />}
                                />
                                <Route
                                  path="orders"
                                  element={<AdminOrdersPage />}
                                />
                                <Route
                                  path="menu"
                                  element={<AdminMenuPage />}
                                />
                                <Route
                                  path="menu/new"
                                  element={<AdminMenuFormPage />}
                                />
                                <Route
                                  path="menu/:id/edit"
                                  element={<AdminMenuFormPage />}
                                />
                                <Route
                                  path="categories"
                                  element={<AdminCategoriesPage />}
                                />
                                <Route
                                  path="users"
                                  element={<AdminUsersPage />}
                                />
                                <Route
                                  path="reviews"
                                  element={<AdminReviewsPage />}
                                />
                                <Route
                                  path="messages"
                                  element={<AdminMessagesPage />}
                                />
                                <Route
                                  path="restaurant"
                                  element={<AdminRestaurantPage />}
                                />
                              </Routes>
                            </AdminLayout>
                          </AdminRoute>
                        }
                      />
                    </Routes>
                  </BrowserRouter>
                </AdminAuthProvider>
              </AuthProvider>
            </CartProvider>
          </OrderProvider>
        </MenuProvider>
      </RestaurantProvider>
    </LanguageProvider>
  );
}
