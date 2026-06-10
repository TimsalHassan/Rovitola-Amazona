import math
import time
import urllib.request
import urllib.parse
import json
from django.utils import timezone
from django.conf import settings as django_settings


def geocode_address(street, city, postal, country="Finland"):
    """
    Primary: Nominatim (free, unlimited — works on production VPS)
    Fallback: Positionstack (for when Nominatim fails)
    """
    lat, lon = _geocode_nominatim(street, city, postal, country)
    if lat is not None:
        return lat, lon

    api_key = getattr(django_settings, 'POSITIONSTACK_API_KEY', None)
    if api_key:
        return _geocode_positionstack(street, city, postal, country, api_key)

    return None, None


def _geocode_nominatim(street, city, postal, country):
    try:
        from geopy.geocoders import Nominatim
        from geopy.exc import GeocoderTimedOut, GeocoderServiceError

        geolocator = Nominatim(
            user_agent="RavintolaAmazona/1.0 (contact@ravintolaamazona.fi)"
        )

        def try_geocode(query):
            for attempt in range(2):
                try:
                    return geolocator.geocode(query, timeout=8)
                except GeocoderTimedOut:
                    if attempt == 0:
                        time.sleep(1)
                except GeocoderServiceError:
                    pass
            return None

        loc = try_geocode(f"{street}, {postal} {city}, {country}")
        if loc:
            return loc.latitude, loc.longitude

        loc = try_geocode(f"{street}, {city}, {country}")
        if loc:
            return loc.latitude, loc.longitude

    except Exception:
        pass

    return None, None


def _geocode_positionstack(street, city, postal, country, api_key):
    queries = [
        f"{street}, {postal} {city}, {country}",
        f"{street}, {city}, {country}",
    ]
    for query in queries:
        try:
            url = "http://api.positionstack.com/v1/forward?" + urllib.parse.urlencode({
                "access_key": api_key,
                "query": query,
                "country": "FI",
                "limit": 1,
            })
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "RavintolaAmazona/1.0"}
            )
            with urllib.request.urlopen(req, timeout=8) as r:
                data = json.loads(r.read().decode("utf-8"))
                results = data.get("data", [])
                if results:
                    return results[0]["latitude"], results[0]["longitude"]
        except Exception:
            pass
        time.sleep(0.3)
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
    # ── Guard: agar geocoding fail ho toh crash mat karo ──
    if customer_lat is None or customer_lon is None:
        return None, None

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

    open_time_str = today.open_time.strftime("%H:%M") if today.open_time else "N/A"
    close_time_str = today.close_time.strftime("%H:%M") if today.close_time else "N/A"

    if today.is_closed:
        return False, "We are closed today."

    if today.open_time and today.close_time:
        if today.close_time < today.open_time:
            if current_time >= today.open_time or current_time <= today.close_time:
                return True, "We are open now."
        else:
            if today.open_time <= current_time <= today.close_time:
                return True, "We are open now."

    return False, f"We are currently closed. Today's hours: {open_time_str} – {close_time_str}."