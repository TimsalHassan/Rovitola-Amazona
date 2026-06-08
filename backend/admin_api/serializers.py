from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.db.models import Count

from menu.models import Category, MenuItem, Extra, ExtraOption
from orders.models import Order, OrderItem
from reviews.models import Review
from contact.models import ContactMessage
from restaurant.models import RestaurantSettings, OpeningHours

User = get_user_model()


# ──────────────────────────────────────────────────────────────────────────────
# USERS
# ──────────────────────────────────────────────────────────────────────────────

class AdminUserSerializer(serializers.ModelSerializer):
    orders_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id", "name", "email", "phone",
            "is_staff", "is_email_verified",
            "date_joined", "orders_count",
        ]

    def get_orders_count(self, obj):
        return obj.orders.count()


# ──────────────────────────────────────────────────────────────────────────────
# CATEGORIES
# ──────────────────────────────────────────────────────────────────────────────

class AdminCategorySerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id", "name", "name_fi",
            "description", "description_fi",
            "slug", "order",
            "has_deal", "deal_label", "deal_label_fi",
            "items_count",
        ]
        # slug auto-generated if blank, so not required on create
        extra_kwargs = {
            "slug": {"required": False},
        }

    def get_items_count(self, obj):
        return obj.items.count()

    def validate_slug(self, value):
        """Slug must be unique — but allow same slug on update (same object)."""
        qs = Category.objects.filter(slug=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A category with this slug already exists.")
        return value


# ──────────────────────────────────────────────────────────────────────────────
# EXTRAS  (used inside Admin Menu Form to show/edit extras per category)
# ──────────────────────────────────────────────────────────────────────────────

class AdminExtraOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExtraOption
        fields = [
            "id", "name", "name_fi",
            "additional_price", "sale_price",
            "order",
        ]


class AdminExtraSerializer(serializers.ModelSerializer):
    options = AdminExtraOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Extra
        fields = [
            "id", "category",
            "name", "name_fi",
            "extra_type", "is_required",
            "max_selections", "order",
            "options",
        ]


# ──────────────────────────────────────────────────────────────────────────────
# MENU ITEMS
# ──────────────────────────────────────────────────────────────────────────────

class AdminMenuItemListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for the list page."""
    category_name = serializers.CharField(source="category.name", read_only=True)
    category_slug = serializers.CharField(source="category.slug", read_only=True)
    current_price = serializers.ReadOnlyField()
    is_on_sale = serializers.ReadOnlyField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "category", "category_name", "category_slug",
            "name", "name_fi",
            "description", "description_fi",
            "base_price", "sale_price",
            "current_price", "is_on_sale",
            "image",
            "is_available", "is_menu_item", "is_lunch_item",
            "created_at",
        ]

    def get_image(self, obj):
        return obj.image.url if obj.image else None


class AdminMenuItemWriteSerializer(serializers.ModelSerializer):
    """Used for CREATE and UPDATE — accepts multipart (image upload)."""
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = MenuItem
        fields = [
            "category",
            "name", "name_fi",
            "description", "description_fi",
            "base_price", "sale_price",
            "image",
            "is_available", "is_menu_item", "is_lunch_item",
        ]

    def validate(self, data):
        if not data.get("name") and not data.get("name_fi"):
            raise serializers.ValidationError(
                {"name": "At least one of name (EN) or name (FI) is required."}
            )
        return data


# ──────────────────────────────────────────────────────────────────────────────
# ORDERS
# ──────────────────────────────────────────────────────────────────────────────

class AdminOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = [
            "id",
            "menu_item_name", "menu_item_name_fi",
            "quantity",
            "base_price", "total_price",
            "special_instruction",
        ]


class AdminOrderSerializer(serializers.ModelSerializer):
    items = AdminOrderItemSerializer(many=True, read_only=True)
    customer_name = serializers.SerializerMethodField()
    customer_email = serializers.SerializerMethodField()
    customer_phone = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id", "order_number",
            "customer", "customer_name", "customer_email", "customer_phone",
            "guest_name", "guest_email", "guest_phone",
            "status", "order_type",
            "delivery_address", "order_notes",
            "payment_status", "payment_method",
            "paytrail_stamp", "paytrail_tx_id",
            "subtotal", "delivery_charge", "discount_amount", "total",
            "created_at", "updated_at",
            "items",
        ]

    def get_customer_name(self, obj):
        return obj.get_customer_name()

    def get_customer_email(self, obj):
        return obj.get_customer_email()

    def get_customer_phone(self, obj):
        return obj.get_customer_phone()


class AdminOrderStatusSerializer(serializers.ModelSerializer):
    """Only for PATCH status updates from the admin panel."""
    class Meta:
        model = Order
        fields = ["status", "payment_status"]


# ──────────────────────────────────────────────────────────────────────────────
# REVIEWS
# ──────────────────────────────────────────────────────────────────────────────

class AdminReviewSerializer(serializers.ModelSerializer):
    customer_name = serializers.CharField(source="customer.name", read_only=True)
    customer_email = serializers.CharField(source="customer.email", read_only=True)

    class Meta:
        model = Review
        fields = [
            "id",
            "customer", "customer_name", "customer_email",
            "rating", "text",
            "is_approved",
            "created_at",
        ]
        read_only_fields = ["customer", "rating", "text", "created_at"]


# ──────────────────────────────────────────────────────────────────────────────
# CONTACT MESSAGES
# ──────────────────────────────────────────────────────────────────────────────

class AdminContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = [
            "id", "name", "email", "phone",
            "subject", "message",
            "is_read", "created_at",
        ]
        read_only_fields = [
            "name", "email", "phone",
            "subject", "message", "created_at",
        ]


# ──────────────────────────────────────────────────────────────────────────────
# RESTAURANT SETTINGS
# ──────────────────────────────────────────────────────────────────────────────

class AdminOpeningHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningHours
        fields = [
            "id", "day",
            "is_closed",
            "open_time", "close_time",
            "lunch_open", "lunch_close",
        ]


class AdminRestaurantSettingsSerializer(serializers.ModelSerializer):
    opening_hours = AdminOpeningHoursSerializer(many=True, read_only=True)

    class Meta:
        model = RestaurantSettings
        fields = [
            "id",
            "name", "address", "phone", "phone_2", "email",
            "latitude", "longitude",
            "is_delivery_enabled",
            "free_delivery_radius_km", "paid_delivery_radius_km",
            "delivery_fee", "min_order",
            "opening_hours",
        ]


class AdminOpeningHoursWriteSerializer(serializers.ModelSerializer):
    """For bulk-updating all 7 days at once."""
    class Meta:
        model = OpeningHours
        fields = [
            "id", "day",
            "is_closed",
            "open_time", "close_time",
            "lunch_open", "lunch_close",
        ]


# ──────────────────────────────────────────────────────────────────────────────
# DASHBOARD STATS
# ──────────────────────────────────────────────────────────────────────────────

class AdminDashboardStatsSerializer(serializers.Serializer):
    total_orders = serializers.IntegerField()
    pending_orders = serializers.IntegerField()
    total_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    today_revenue = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_users = serializers.IntegerField()
    total_menu_items = serializers.IntegerField()
    total_categories = serializers.IntegerField()
    unread_messages = serializers.IntegerField()
    pending_reviews = serializers.IntegerField()