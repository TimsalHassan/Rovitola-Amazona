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

    open_time_str = (
        today.open_time.strftime("%I:%M %p")
        if today.open_time else "N/A"
    )
    close_time_str = (
        today.close_time.strftime("%I:%M %p")
        if today.close_time else "N/A"
    )

    if today.is_closed:
        return False, (
            f"Closed today. Opens at {open_time_str} "
            f"and closes at {close_time_str}."
        )

    if today.open_time and today.close_time:
        # Handles schedules that cross midnight
        if today.close_time < today.open_time:
            if current_time >= today.open_time or current_time <= today.close_time:
                return True, "Opened"
        else:
            if today.open_time <= current_time <= today.close_time:
                return True, "Opened"

    return False, (
        f"Restaurant is closed. Opens at {open_time_str} "
        f"and closes at {close_time_str}."
    )