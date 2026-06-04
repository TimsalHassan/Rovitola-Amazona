from django.contrib import admin
from .models import Cart, CartItem, CartItemSelectedOption


class CartItemSelectedOptionInline(admin.TabularInline):
    model = CartItemSelectedOption
    extra = 0
    readonly_fields = ['extra_option']


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0
    readonly_fields = ['menu_item', 'quantity', 'unit_price', 'special_instruction']


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'total_items', 'subtotal', 'updated_at']
    inlines = [CartItemInline]
    readonly_fields = ['created_at', 'updated_at']


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ['menu_item', 'quantity', 'unit_price', 'line_total', 'cart']
    inlines = [CartItemSelectedOptionInline]
    readonly_fields = ['created_at', 'updated_at']