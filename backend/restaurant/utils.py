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
    import datetime

    now = timezone.localtime()
    today_name = now.strftime('%A').lower()
    yesterday_name = (now - datetime.timedelta(days=1)).strftime('%A').lower()
    current_time = now.time()

    try:
        today = opening_hours_qs.get(day=today_name)
    except Exception:
        today = None

    try:
        yesterday = opening_hours_qs.get(day=yesterday_name)
    except Exception:
        yesterday = None

    # Pehle check karo: kal ka overnight session abhi tak chal to nahi raha
    # (e.g. kal 18:00 khula, aaj raat 02:00 tak band hota hai — abhi agar
    # 01:00 ho to restaurant abhi bhi "kal" ke session mein open hai).
    if yesterday and not yesterday.is_closed and yesterday.open_time and yesterday.close_time:
        if yesterday.close_time < yesterday.open_time and current_time < yesterday.close_time:
            close_str = yesterday.close_time.strftime("%H:%M")
            return True, f"We are open now (until {close_str})."

    if not today:
        return False, "Opening hours not configured."

    open_time_str = today.open_time.strftime("%H:%M") if today.open_time else "N/A"
    close_time_str = today.close_time.strftime("%H:%M") if today.close_time else "N/A"

    if today.is_closed:
        return False, "We are closed today."

    if today.open_time and today.close_time:
        if today.close_time < today.open_time:
            # Overnight — sirf "open_time ke baad" check karo, "close_time se pehle"
            # wala case ab yahan nahi (wo upar yesterday ke session se cover ho chuka).
            if current_time >= today.open_time:
                return True, "We are open now."
        else:
            if today.open_time <= current_time <= today.close_time:
                return True, "We are open now."

    return False, f"We are currently closed. Today's hours: {open_time_str} – {close_time_str}."


def get_pickup_slots(opening_hours_qs, advance_minutes=60, slot_interval=15, days_ahead=2):
    """
    "Today" aur "Tomorrow" (default `days_ahead=2`) ke liye pickup time slots banata hai.

    Rules:
    - Agar restaurant abhi open hai -> earliest slot = abhi + advance_minutes.
    - Agar band hai (abhi tak nahi khula, ya already band) -> earliest slot =
      us session ke open_time + advance_minutes.
    - Overnight hours (close_time < open_time, e.g. 18:00–02:00) sahi handle hote
      hain — including pichle din ka session jo aaj subah tak "bleed" karta hai
      (e.g. kal 11AM khula, aaj 3AM tak band hota hai — raat 1 baje abhi bhi
      "open" treat hoga, us session ki slots "Today" mein milengi).
    - Lunch break (lunch_open/lunch_close) ke darmiyan slots exclude hote hain.
    """
    import datetime

    now = timezone.localtime()
    tz = now.tzinfo
    today_date = now.date()
    last_date = today_date + datetime.timedelta(days=days_ahead - 1)

    def round_up(dt, interval_minutes):
        discard = datetime.timedelta(
            minutes=dt.minute % interval_minutes,
            seconds=dt.second,
            microseconds=dt.microsecond,
        )
        dt -= discard
        if discard:
            dt += datetime.timedelta(minutes=interval_minutes)
        return dt

    def date_label_for(d):
        if d == today_date:
            return "Today"
        if d == today_date + datetime.timedelta(days=1):
            return "Tomorrow"
        return f"{d.strftime('%A')} {d.day} {d.strftime('%b')}"

    hours_by_day = {oh.day: oh for oh in opening_hours_qs}
    slots = []

    # day_offset = -1 se shuru karo — kal ka overnight session aaj subah tak
    # "bleed" ho sakta hai, isliye uska bhi session check karna zaroori hai.
    for day_offset in range(-1, days_ahead):
        day_date = today_date + datetime.timedelta(days=day_offset)
        day_name = day_date.strftime('%A').lower()
        hours = hours_by_day.get(day_name)

        if not hours or hours.is_closed or not hours.open_time or not hours.close_time:
            continue

        open_dt = datetime.datetime.combine(day_date, hours.open_time, tzinfo=tz)
        close_dt = datetime.datetime.combine(day_date, hours.close_time, tzinfo=tz)
        if close_dt <= open_dt:
            close_dt += datetime.timedelta(days=1)

        # Ye session already poora khatam ho chuka — skip karo
        if close_dt <= now:
            continue

        lunch_open_dt = lunch_close_dt = None
        if hours.lunch_open and hours.lunch_close:
            lunch_open_dt = datetime.datetime.combine(day_date, hours.lunch_open, tzinfo=tz)
            lunch_close_dt = datetime.datetime.combine(day_date, hours.lunch_close, tzinfo=tz)
            if lunch_close_dt <= lunch_open_dt:
                lunch_close_dt += datetime.timedelta(days=1)

        if open_dt <= now:
            # Is session ke andar abhi open hai (chahe aaj ka ho ya kal se chala aa raha ho)
            earliest = now + datetime.timedelta(minutes=advance_minutes)
        else:
            # Session abhi shuru nahi hua
            earliest = open_dt + datetime.timedelta(minutes=advance_minutes)

        first_slot = round_up(max(open_dt, earliest), slot_interval)

        slot = first_slot
        while slot + datetime.timedelta(minutes=slot_interval) <= close_dt:
            if slot < earliest:
                slot += datetime.timedelta(minutes=slot_interval)
                continue
            if lunch_open_dt and lunch_close_dt and lunch_open_dt <= slot < lunch_close_dt:
                slot += datetime.timedelta(minutes=slot_interval)
                continue

            slot_date = slot.date()
            if today_date <= slot_date <= last_date:
                slots.append({
                    "value": slot.strftime("%Y-%m-%dT%H:%M"),
                    "label": slot.strftime("%H:%M"),
                    "date_label": date_label_for(slot_date),
                })
            slot += datetime.timedelta(minutes=slot_interval)

    slots.sort(key=lambda s: s["value"])
    return slots