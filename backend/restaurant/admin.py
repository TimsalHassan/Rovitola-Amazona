from django.contrib import admin
from .models import RestaurantSettings, OpeningHours


class OpeningHoursInline(admin.TabularInline):
    model = OpeningHours
    extra = 0


@admin.register(RestaurantSettings)
class RestaurantSettingsAdmin(admin.ModelAdmin):
    inlines = [OpeningHoursInline]

    def has_add_permission(self, request):
        return not RestaurantSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False