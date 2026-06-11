from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.cache import cache

from .models import RestaurantSettings
from .serializers import RestaurantSettingsSerializer, DeliveryCheckSerializer
from .utils import get_delivery_fee, is_restaurant_open, geocode_address 


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

        # Lunch hours alag nikalo
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
                "message": "Delivery is currently not available.",
            })

        data = serializer.validated_data
        lat = data.get('latitude')
        lon = data.get('longitude')

        # ── NEW: agar lat/lon nahi, address se geocode karo ──
        if lat is None or lon is None:
            street = data.get('street', '')
            city = data.get('city', '')
            postal = data.get('postal', '')
            country = data.get('country', 'Finland')

            if not street.strip():
                return Response({
                    "is_eligible": False,
                    "delivery_fee": None,
                    "distance_km": None,
                    "message": "Please enter a delivery address.",
                })

            lat, lon = geocode_address(street, city, postal, country)

            if lat is None:
                return Response({
                    "is_eligible": False,
                    "delivery_fee": None,
                    "distance_km": None,
                    "message": "Address is not in the radius",
                })
        # ── existing logic same rehti hai ──

        fee, distance = get_delivery_fee(lat, lon, settings)
        distance_rounded = round(distance, 1)

        if fee is None:
            return Response({
                "is_eligible": False,
                "delivery_fee": None,
                "distance_km": distance_rounded,
                "message": f"Sorry, delivery is not available to your location ({distance_rounded}km). Maximum delivery radius is {settings.paid_delivery_radius_km}km.",
            })

        fee_float = round(float(fee), 2)
        message = f"Free delivery! ({distance_rounded}km)" if fee_float == 0 else f"€{fee_float:.2f} delivery fee. ({distance_rounded}km)"
        return Response({
            "is_eligible": True,
            "delivery_fee": fee_float,
            "distance_km": distance_rounded,
            "message": message,
        })