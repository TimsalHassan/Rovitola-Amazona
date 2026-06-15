from rest_framework import serializers
from .models import Category, MenuItem, Extra, ExtraOption


class CategorySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    deal_label = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            "id", "name", "description", "slug", "order",
            "has_deal", "deal_label",
        ]

    def _lang(self, request):
        if request:
            return request.query_params.get('language', 'en').lower()
        return 'en'

    def get_name(self, obj):
        lang = self._lang(self.context.get('request'))
        return obj.name_fi if lang == 'fi' else obj.name

    def get_description(self, obj):
        lang = self._lang(self.context.get('request'))
        return obj.description_fi if lang == 'fi' else obj.description

    def get_deal_label(self, obj):
        lang = self._lang(self.context.get('request'))
        return obj.deal_label_fi if lang == 'fi' else obj.deal_label


class ExtraOptionSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    display_price = serializers.ReadOnlyField()
    is_on_sale = serializers.ReadOnlyField()

    class Meta:
        model = ExtraOption
        fields = [
            "id", "name", "name_fi",
            "additional_price", "sale_price",
            "display_price", "is_on_sale", "order",
            "is_default",
        ]

    def get_name(self, obj):
        request = self.context.get('request')
        lang = request.query_params.get('language', 'en').lower() if request else 'en'
        return obj.name_fi if lang == 'fi' else obj.name


class ExtraSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    options = ExtraOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Extra
        fields = [
            "id", "category", "name", "name_fi",
            "extra_type", "is_required", "max_selections",
            "order", "options",
        ]

    def get_name(self, obj):
        request = self.context.get('request')
        lang = request.query_params.get('language', 'en').lower() if request else 'en'
        return obj.name_fi if lang == 'fi' else obj.name


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    category_slug = serializers.SerializerMethodField()
    category_description = serializers.SerializerMethodField()
    category_deal_label = serializers.SerializerMethodField()
    category_has_deal = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    description = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    current_price = serializers.ReadOnlyField()
    is_on_sale = serializers.ReadOnlyField()
    extras = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "category", "category_name", "category_slug",
            "category_description", 
            "category_deal_label",
            "category_has_deal",      
            "name", "name_fi",
            "description", "description_fi",
            "base_price", "sale_price",
            "current_price", "is_on_sale",
            "image",
            "is_available", "is_menu_item", "is_lunch_item",
            "created_at",
            "extras",
        ]

    def get_image(self, obj):
        if obj.image:
            return obj.image.url
        return None

    def _lang(self, request):
        if request:
            return request.query_params.get('language', 'en').lower()
        return 'en'

    def get_name(self, obj):
        lang = self._lang(self.context.get('request'))
        return obj.name_fi if lang == 'fi' else obj.name

    def get_description(self, obj):
        lang = self._lang(self.context.get('request'))
        return obj.description_fi if lang == 'fi' else obj.description

    def get_category_name(self, obj):
        lang = self._lang(self.context.get('request'))
        return obj.category.name_fi if lang == 'fi' else obj.category.name

    def get_category_slug(self, obj):
        return obj.category.slug

    def get_category_description(self, obj):
        lang = self._lang(self.context.get('request'))
        return obj.category.description_fi if lang == 'fi' else obj.category.description

    def get_category_deal_label(self, obj):
        lang = self._lang(self.context.get('request'))
        return obj.category.deal_label_fi if lang == 'fi' else obj.category.deal_label

    def get_category_has_deal(self, obj):
        return obj.category.has_deal

    def get_extras(self, obj):
        """Return category extras (same for all items in this category)"""
        extras = obj.category.extras.prefetch_related('options').all()
        return ExtraSerializer(extras, many=True, context=self.context).data
