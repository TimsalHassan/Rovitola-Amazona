from rest_framework import serializers
from menu.models import MenuItem, ExtraOption
from .models import Cart, CartItem, CartItemSelectedOption


# ── Read Serializers ───────────────────────────────────────────────────────────

class CartItemSelectedOptionReadSerializer(serializers.ModelSerializer):
    extra_name = serializers.CharField(source='extra_option.extra.name')
    extra_name_fi = serializers.CharField(source='extra_option.extra.name_fi')
    option_name = serializers.CharField(source='extra_option.name')
    option_name_fi = serializers.CharField(source='extra_option.name_fi')
    additional_price = serializers.DecimalField(
        source='extra_option.display_price', max_digits=6, decimal_places=2
    )

    class Meta:
        model = CartItemSelectedOption
        fields = [
            'id', 'extra_option',
            'extra_name', 'extra_name_fi',
            'option_name', 'option_name_fi',
            'additional_price',
        ]


class CartItemReadSerializer(serializers.ModelSerializer):
    menu_item_id = serializers.IntegerField(source='menu_item.id')
    menu_item_name = serializers.CharField(source='menu_item.name')
    menu_item_name_fi = serializers.CharField(source='menu_item.name_fi')
    menu_item_image = serializers.ImageField(source='menu_item.image')
    selected_options = CartItemSelectedOptionReadSerializer(many=True, read_only=True)
    line_total = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = CartItem
        fields = [
            'id',
            'menu_item_id', 'menu_item_name', 'menu_item_name_fi', 'menu_item_image',
            'quantity', 'unit_price', 'line_total',
            'special_instruction',
            'selected_options',
        ]


class CartReadSerializer(serializers.ModelSerializer):
    items = CartItemReadSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    subtotal = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    class Meta:
        model = Cart
        fields = ['id', 'total_items', 'subtotal', 'items', 'updated_at']


# ── Write Serializers ──────────────────────────────────────────────────────────

class AddToCartSerializer(serializers.Serializer):
    menu_item_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    special_instruction = serializers.CharField(required=False, allow_blank=True, default='')
    selected_option_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=[]
    )

    def validate_menu_item_id(self, value):
        try:
            item = MenuItem.objects.get(id=value, is_available=True)
        except MenuItem.DoesNotExist:
            raise serializers.ValidationError("Menu item not found or unavailable.")
        return value

    def validate_selected_option_ids(self, value):
        if value:
            existing_ids = set(ExtraOption.objects.filter(id__in=value).values_list('id', flat=True))
            invalid = set(value) - existing_ids
            if invalid:
                raise serializers.ValidationError(f"Invalid option IDs: {invalid}")
        return value


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    special_instruction = serializers.CharField(required=False, allow_blank=True)
    selected_option_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False
    )

    def validate_selected_option_ids(self, value):
        if value:
            existing_ids = set(ExtraOption.objects.filter(id__in=value).values_list('id', flat=True))
            invalid = set(value) - existing_ids
            if invalid:
                raise serializers.ValidationError(f"Invalid option IDs: {invalid}")
        return value