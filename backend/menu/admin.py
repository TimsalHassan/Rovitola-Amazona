from django.contrib import admin
from .models import Category, MenuItem, Extra, ExtraOption


class ExtraInline(admin.TabularInline):
    model = Extra
    extra = 0
    show_change_link = True


class ExtraOptionInline(admin.TabularInline):
    model = ExtraOption
    extra = 0


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "name_fi", "slug", "order", "has_deal", "deal_label"]
    list_editable = ["order", "has_deal"]
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ExtraInline]


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = [
        "name", "category", "base_price", "sale_price",
        "current_price", "is_on_sale", "is_available", "is_lunch_item",
    ]
    list_filter = ["category", "is_available", "is_lunch_item"]
    search_fields = ["name", "name_fi"]
    list_editable = ["base_price", "sale_price", "is_available"]

    def current_price(self, obj):
        return obj.current_price
    current_price.short_description = "Current Price"

    def is_on_sale(self, obj):
        return obj.is_on_sale
    is_on_sale.boolean = True
    is_on_sale.short_description = "On Sale"


@admin.register(Extra)
class ExtraAdmin(admin.ModelAdmin):
    list_display = ["name", "name_fi", "category", "extra_type", "is_required", "max_selections", "order"]
    list_filter = ["category", "extra_type", "is_required"]
    search_fields = ["name", "name_fi"]
    list_editable = ["extra_type", "is_required", "order"]
    ordering = ["category", "order"]
    inlines = [ExtraOptionInline]


@admin.register(ExtraOption)
class ExtraOptionAdmin(admin.ModelAdmin):
    list_display = ["name", "name_fi", "extra", "additional_price", "sale_price", "display_price", "order"]
    list_filter = ["extra__category", "extra"]
    search_fields = ["name", "name_fi"]
    list_editable = ["additional_price", "sale_price", "order"]
    ordering = ["extra", "order"]

    def display_price(self, obj):
        return obj.display_price
    display_price.short_description = "Effective Price"
