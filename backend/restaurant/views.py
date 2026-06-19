from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.cache import cache

from .models import RestaurantSettings
from .serializers import RestaurantSettingsSerializer, DeliveryCheckSerializer
from .utils import get_delivery_fee, is_restaurant_open, geocode_address, get_pickup_slots


class RestaurantInfoView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        CACHE_KEY = 'restaurant_info'

        cached = cache.get(CACHE_KEY)
        if cached:
            return Response(cached)

        settings = RestaurantSettings.get_settings()
        if not settings:
            return Response({"detail": "Not configured."}, status=503)

        serializer = RestaurantSettingsSerializer(settings)
        open_now, message = is_restaurant_open(settings.opening_hours.all())

        lunch_hours = [
            {
                "day": oh.day,
                "is_closed": oh.is_closed,
                "lunch_open": str(oh.lunch_open) if oh.lunch_open else None,
                "lunch_close": str(oh.lunch_close) if oh.lunch_close else None,
            }
            for oh in settings.opening_hours.all().order_by("day")
            if oh.lunch_open and oh.lunch_close
        ]

        data = {
            **serializer.data,
            "is_open_now": open_now,
            "open_status_message": message,
            "lunch_hours": lunch_hours,
        }

        cache.set(CACHE_KEY, data, timeout=60 * 15)
        return Response(data)


class DeliveryCheckView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DeliveryCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        settings = RestaurantSettings.get_settings()
        if not settings:
            return Response({"detail": "Not configured."}, status=503)

        if not settings.is_delivery_enabled:
            return Response({
                "is_eligible": False,
                "delivery_fee": None,
                "distance_km": None,
                "zone": None,
                "message": "Delivery is currently not available.",
            })

        data = serializer.validated_data
        lat = data.get('latitude')
        lon = data.get('longitude')

        # Geocode from address fields if lat/lon not provided
        if lat is None or lon is None:
            street  = data.get('street', '')
            city    = data.get('city', '')
            postal  = data.get('postal', '')
            country = data.get('country', 'Finland')

            if not street.strip():
                return Response({
                    "is_eligible": False,
                    "delivery_fee": None,
                    "distance_km": None,
                    "zone": None,
                    "message": "Please enter a delivery address.",
                })

            lat, lon = geocode_address(street, city, postal, country)

            # Geocoding failed — address not recognized
            if lat is None:
                return Response({
                    "is_eligible": False,
                    "delivery_fee": None,
                    "distance_km": None,
                    "zone": "address_not_found",
                    "message": "Address not found. Please check your street, city and postal code.",
                })

        fee, distance = get_delivery_fee(lat, lon, settings)
        distance_rounded = round(distance, 1)

        # Zone 3b — address found but beyond paid delivery radius
        if fee is None:
            return Response({
                "is_eligible": False,
                "delivery_fee": None,
                "distance_km": distance_rounded,
                "zone": "out_of_range",
                "message": (
                    f"Sorry, we don't deliver to your address. "
                    f"Your location is {distance_rounded}km away — "
                    f"our maximum delivery radius is {settings.paid_delivery_radius_km}km."
                ),
            })

        fee_float = round(float(fee), 2)

        # Zone 1 — free delivery
        if fee_float == 0:
            return Response({
                "is_eligible": True,
                "delivery_fee": 0,
                "distance_km": distance_rounded,
                "zone": "free",
                "message": f"Free delivery! ({distance_rounded}km)",
            })

        # Zone 2 — paid delivery
        return Response({
            "is_eligible": True,
            "delivery_fee": fee_float,
            "distance_km": distance_rounded,
            "zone": "paid",
            "message": f"€{fee_float:.2f} delivery fee ({distance_rounded}km).",
        })


class PickupSlotsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        settings = RestaurantSettings.get_settings()
        if not settings:
            return Response({"detail": "Not configured."}, status=503)

        slots = get_pickup_slots(settings.opening_hours.all())
        return Response({"slots": slots})