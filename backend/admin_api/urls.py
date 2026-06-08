from django.urls import path
from .views import (
    # Dashboard
    AdminDashboardStatsView,

    # Users
    AdminUserListView,
    AdminUserDetailView,

    # Categories
    AdminCategoryListCreateView,
    AdminCategoryDetailView,

    # Menu Items
    AdminMenuItemListCreateView,
    AdminMenuItemDetailView,
    AdminMenuItemToggleView,

    # Extras
    AdminExtraListView,

    # Orders
    AdminOrderListView,
    AdminOrderDetailView,
    AdminOrderStatusUpdateView,

    # Reviews
    AdminReviewListView,
    AdminReviewDetailView,

    # Contact Messages
    AdminContactMessageListView,
    AdminContactMessageDetailView,

    # Restaurant Settings
    AdminRestaurantSettingsView,
    AdminOpeningHoursBulkUpdateView,
)

urlpatterns = [
    # ── Dashboard ──────────────────────────────────────────────────────────
    path("stats/",                          AdminDashboardStatsView.as_view(),          name="admin-stats"),

    # ── Users ──────────────────────────────────────────────────────────────
    path("users/",                          AdminUserListView.as_view(),                name="admin-users"),
    path("users/<int:pk>/",                 AdminUserDetailView.as_view(),              name="admin-user-detail"),

    # ── Categories ─────────────────────────────────────────────────────────
    path("categories/",                     AdminCategoryListCreateView.as_view(),      name="admin-categories"),
    path("categories/<int:pk>/",            AdminCategoryDetailView.as_view(),          name="admin-category-detail"),

    # ── Menu Items ─────────────────────────────────────────────────────────
    path("menu-items/",                     AdminMenuItemListCreateView.as_view(),      name="admin-menu-items"),
    path("menu-items/<int:pk>/",            AdminMenuItemDetailView.as_view(),          name="admin-menu-item-detail"),
    path("menu-items/<int:pk>/toggle/",     AdminMenuItemToggleView.as_view(),          name="admin-menu-item-toggle"),

    # ── Extras ─────────────────────────────────────────────────────────────
    path("extras/",                         AdminExtraListView.as_view(),               name="admin-extras"),

    # ── Orders ─────────────────────────────────────────────────────────────
    path("orders/",                         AdminOrderListView.as_view(),               name="admin-orders"),
    path("orders/<str:order_number>/",      AdminOrderDetailView.as_view(),             name="admin-order-detail"),
    path("orders/<str:order_number>/status/", AdminOrderStatusUpdateView.as_view(),     name="admin-order-status"),

    # ── Reviews ────────────────────────────────────────────────────────────
    path("reviews/",                        AdminReviewListView.as_view(),              name="admin-reviews"),
    path("reviews/<int:pk>/",               AdminReviewDetailView.as_view(),            name="admin-review-detail"),

    # ── Contact Messages ───────────────────────────────────────────────────
    path("messages/",                       AdminContactMessageListView.as_view(),      name="admin-messages"),
    path("messages/<int:pk>/",              AdminContactMessageDetailView.as_view(),    name="admin-message-detail"),

    # ── Restaurant Settings ────────────────────────────────────────────────
    path("restaurant/",                     AdminRestaurantSettingsView.as_view(),      name="admin-restaurant"),
    path("restaurant/hours/",               AdminOpeningHoursBulkUpdateView.as_view(),  name="admin-restaurant-hours"),
]