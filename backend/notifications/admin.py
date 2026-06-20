from django.contrib import admin

from .models import PushSubscription


@admin.register(PushSubscription)
class PushSubscriptionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "user_agent", "created_at")
    list_filter = ("created_at",)
    search_fields = ("user__email", "endpoint")