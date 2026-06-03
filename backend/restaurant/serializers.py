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
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()