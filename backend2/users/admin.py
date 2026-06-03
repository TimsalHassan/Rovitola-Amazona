from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, Address


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ["email", "name", "phone", "is_staff", "date_joined"]
    search_fields = ["email", "name", "phone"]
    ordering = ["-date_joined"]

    # Override fieldsets to remove username, add name/phone
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal Info", {"fields": ("name", "phone")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups", "user_permissions",
                )
            },
        ),
        ("Important Dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "phone", "password1", "password2"),
            },
        ),
    )


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ["user", "street_address", "city", "postal_code", "country", "is_default", "created_at"]
    search_fields = ["user__email", "street_address", "city"]
    list_filter = ["is_default", "country", "created_at"]
    ordering = ["-is_default", "-created_at"]