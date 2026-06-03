from django.contrib import admin
from .models import Order, OrderItem, OrderItemSelectedOption


class OrderItemSelectedOptionInline(admin.TabularInline):
    model = OrderItemSelectedOption
    extra = 0
    readonly_fields = ["extra_name", "option_name", "additional_price"]


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = [
        "menu_item_name", "quantity",
        "base_price", "total_price", "special_instruction",
    ]
    show_change_link = True


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = [
        "order_number", "get_customer", "get_phone",
        "status", "order_type", "total", "created_at",
    ]
    list_filter  = ["status", "order_type", "created_at"]
    search_fields = ["order_number", "guest_phone", "guest_name"]
    readonly_fields = ["order_number", "created_at", "updated_at"]
    list_per_page = 20
    inlines = [OrderItemInline]
    change_list_template = "admin/orders/order/change_list.html"

    def get_customer(self, obj):
        return obj.get_customer_name()
    get_customer.short_description = "Customer"

    def get_phone(self, obj):
        return obj.get_customer_phone()
    get_phone.short_description = "Phone"


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = [
        "menu_item_name", "order", "quantity",
        "base_price", "total_price", "special_instruction",
    ]
    readonly_fields = ["order"]
    inlines = [OrderItemSelectedOptionInline]
