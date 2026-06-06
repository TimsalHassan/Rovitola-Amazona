from rest_framework import serializers
from .models import Order, OrderItem, OrderItemSelectedOption


# ── Read serializers ──────────────────────────────────────────────────────────

class OrderItemSelectedOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItemSelectedOption
        fields = [
            "extra_name", "extra_name_fi",
            "option_name", "option_name_fi",
            "additional_price",
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    selected_options = OrderItemSelectedOptionSerializer(many=True, read_only=True)

    class Meta:
        model = OrderItem
        fields = [
            "id",
            "menu_item_name",
            "menu_item_name_fi",
            "quantity",
            "base_price",
            "total_price",
            "special_instruction",
            "selected_options",
        ]


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "customer",
            "customer_name",
            "guest_name",
            "guest_phone",
            "status",
            "payment_status",
            "payment_method",
            "order_type",
            "delivery_address",
            "order_notes",
            "subtotal",
            "delivery_charge",
            "discount_amount",
            "total",
            "created_at",
            "updated_at",
            "items",
        ]

    def get_customer_name(self, obj):
        return obj.get_customer_name()


# ── Write serializers ─────────────────────────────────────────────────────────

class CreateSelectedOptionSerializer(serializers.Serializer):
    extra_name      = serializers.CharField(max_length=100)
    extra_name_fi   = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    option_name     = serializers.CharField(max_length=100)
    option_name_fi  = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    additional_price = serializers.DecimalField(max_digits=6, decimal_places=2, default=0)


class CreateOrderItemSerializer(serializers.Serializer):
    menu_item_name    = serializers.CharField(max_length=200)
    menu_item_name_fi = serializers.CharField(max_length=200, required=False, allow_blank=True, default="")
    quantity          = serializers.IntegerField(min_value=1)
    base_price        = serializers.DecimalField(max_digits=6, decimal_places=2)
    total_price       = serializers.DecimalField(max_digits=6, decimal_places=2)
    special_instruction = serializers.CharField(required=False, allow_blank=True, default="")
    selected_options  = CreateSelectedOptionSerializer(many=True, required=False, default=[])


class CreateOrderSerializer(serializers.Serializer):
    guest_name  = serializers.CharField(max_length=100, required=False, allow_blank=True, default="")
    guest_phone = serializers.CharField(max_length=20,  required=False, allow_blank=True, default="")
    guest_email = serializers.EmailField(required=False, allow_blank=True, default="") 
    order_type  = serializers.ChoiceField(choices=["delivery", "pickup"], default="delivery")
    payment_method = serializers.ChoiceField(choices=["online", "cash_on_delivery", "card_on_delivery"], default="online")
    delivery_address = serializers.CharField(required=False, allow_blank=True, default="")
    order_notes      = serializers.CharField(required=False, allow_blank=True, default="")
    subtotal         = serializers.DecimalField(max_digits=8, decimal_places=2)
    delivery_charge  = serializers.DecimalField(max_digits=5, decimal_places=2, default=0)
    discount_amount  = serializers.DecimalField(max_digits=5, decimal_places=2, default=0)
    total            = serializers.DecimalField(max_digits=8, decimal_places=2)
    items            = CreateOrderItemSerializer(many=True)

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("Order must have at least one item.")
        return value

    def validate(self, data):
        if data.get("order_type") == "delivery" and not data.get("delivery_address", "").strip():
            raise serializers.ValidationError(
                {"delivery_address": "Delivery address is required for delivery orders."}
            )
        return data

    def create(self, validated_data):
        items_data = validated_data.pop("items")
        request    = self.context.get("request")
        customer   = request.user if request and request.user.is_authenticated else None

        order = Order.objects.create(customer=customer, **validated_data)

        for item_data in items_data:
            options_data = item_data.pop("selected_options", [])
            order_item   = OrderItem.objects.create(order=order, **item_data)
            for opt in options_data:
                OrderItemSelectedOption.objects.create(order_item=order_item, **opt)

        # Wrap emails so a config error never kills a valid order
        try:
            send_order_confirmation(order)
            send_restaurant_notification(order)
        except Exception:
            pass  # log this in production

        return order


# ── Status-only update ────────────────────────────────────────────────────────

class OrderStatusSerializer(serializers.ModelSerializer): 
    class Meta:
        model = Order
        fields = ["status"]

