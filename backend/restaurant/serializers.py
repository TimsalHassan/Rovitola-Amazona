from rest_framework import serializers
from .models import RestaurantSettings, OpeningHours


class OpeningHoursSerializer(serializers.ModelSerializer):
    class Meta:
        model = OpeningHours
        fields = ['day', 'is_closed', 'open_time', 'close_time', 'lunch_open', 'lunch_close']


class RestaurantSettingsSerializer(serializers.ModelSerializer):
    opening_hours = OpeningHoursSerializer(many=True, read_only=True)

    class Meta:
        model = RestaurantSettings
        fields = [
            'name', 'address', 'phone', 'phone_2', 'email',
            'is_delivery_enabled', 'free_delivery_radius_km',
            'paid_delivery_radius_km', 'delivery_fee', 'min_order',
            'opening_hours',
        ]


class DeliveryCheckSerializer(serializers.Serializer):
    # existing lat/lng (optional rakho — ab dono support karega)
    latitude = serializers.FloatField(required=False)
    longitude = serializers.FloatField(required=False)
    # NEW: address-based check
    street = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    postal = serializers.CharField(required=False, allow_blank=True)
    country = serializers.CharField(required=False, default="Finland")