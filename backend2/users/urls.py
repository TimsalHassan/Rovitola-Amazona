from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    ProfileView,
    AddressViewSet,
    ChangePasswordView,
    
    # PasswordResetView,
    # PasswordResetConfirmView,
)

urlpatterns = [
    # path("register/", RegisterView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    # path("logout/", LogoutView.as_view(), name="logout"),
    # path("profile/", ProfileView.as_view(), name="profile"),
    # path("addresses/", AddressViewSet.as_view({"get": "list", "post": "create"}), name="address_list_create"),
    # path("password-change/", ChangePasswordView.as_view(), name="password_change"),
    # path("password-reset/", PasswordResetView.as_view(), name="password_reset"),
    # path("password-reset-confirm/<uidb64>/<token>/", PasswordResetConfirmView.as_view(), name="password_reset_confirm"),
]