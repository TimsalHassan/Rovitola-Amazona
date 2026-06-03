import math
from django.utils import timezone


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

    if today.is_closed:
        return False, "Restaurant aaj closed hai."

    if today.open_time and today.close_time:
        if today.close_time < today.open_time:  # midnight cross
            if current_time >= today.open_time or current_time <= today.close_time:
                return True, "Restaurant open hai."
        else:
            if today.open_time <= current_time <= today.close_time:
                return True, "Restaurant open hai."

    return False, f"Restaurant {today.open_time} se {today.close_time} tak open hota hai."