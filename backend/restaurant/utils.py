import math
from django.utils import timezone
from geopy.geocoders import Nominatim


def geocode_address(street, city, postal, country="Finland"):
    """Address string ko lat/lon mein convert karta hai."""
    geolocator = Nominatim(user_agent="ravintola-amazona")
    query = f"{street}, {postal} {city}, {country}"
    try:
        location = geolocator.geocode(query, timeout=5)
        if location:
            return location.latitude, location.longitude
    except Exception:
        pass
    return None, None


def haversine_distance(lat1, lon1, lat2, lon2):
    R = 6371
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def get_delivery_fee(customer_lat, customer_lon, settings):
    distance = haversine_distance(
        customer_lat, customer_lon,
        settings.latitude, settings.longitude,
    )
    if distance <= settings.free_delivery_radius_km:
        return 0.00, distance
    elif distance <= settings.paid_delivery_radius_km:
        return float(settings.delivery_fee), distance
    else:
        return None, distance

def is_restaurant_open(opening_hours_qs):
    now = timezone.localtime()
    day_name = now.strftime('%A').lower()
    current_time = now.time()

    try:
        today = opening_hours_qs.get(day=day_name)
    except Exception:
        return False, "Opening hours not configured."

    open_time_str = (
        today.open_time.strftime("%H:%M")
        if today.open_time else "N/A"
    )
    close_time_str = (
        today.close_time.strftime("%H:%M")
        if today.close_time else "N/A"
    )

    if today.is_closed:
        return False, f"We are closed today."

    if today.open_time and today.close_time:
        if today.close_time < today.open_time:
            if current_time >= today.open_time or current_time <= today.close_time:
                return True, "We are open now."
        else:
            if today.open_time <= current_time <= today.close_time:
                return True, "We are open now."

    return False, f"We are currently closed. Today's hours: {open_time_str} – {close_time_str}."