import json
import logging

from celery import shared_task
from django.conf import settings
from pywebpush import webpush, WebPushException

from .models import PushSubscription

logger = logging.getLogger(__name__)


@shared_task
def send_new_order_push(order_number: str, total: str, order_type: str):
    """
    Sends a "New order received" browser push notification to every
    registered admin subscription. Works even if no admin currently has the
    dashboard tab open, as long as their browser is running (desktop) or
    their device is online (mobile/PWA installs).

    Dead subscriptions (expired/unsubscribed — HTTP 404/410 from the push
    service) are cleaned up automatically.
    """
    subscriptions = list(PushSubscription.objects.all())
    if not subscriptions:
        logger.info("No push subscriptions registered — skipping order push.")
        return

    payload = json.dumps({
        "title": "🔔 New order received",
        "body": f"#{order_number} · {order_type.capitalize()} · €{total}",
        "url": f"/admin/orders?order={order_number}",
        "tag": f"order-{order_number}",
    })

    dead_endpoints = []

    for sub in subscriptions:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=payload,
                vapid_private_key=settings.VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{settings.VAPID_CLAIMS_EMAIL}"},
            )
        except WebPushException as exc:
            status_code = getattr(exc.response, "status_code", None)
            if status_code in (404, 410):
                dead_endpoints.append(sub.endpoint)
            else:
                logger.warning("Push failed for %s: %s", sub.endpoint, exc)

    if dead_endpoints:
        PushSubscription.objects.filter(endpoint__in=dead_endpoints).delete()