import hmac
import hashlib
import json
import uuid
import requests
from datetime import datetime, timezone
from django.conf import settings
import logging
from decimal import Decimal, ROUND_HALF_UP

logger = logging.getLogger(__name__)


def make_headers(method: str) -> dict:
    return {
        "checkout-account":   str(settings.PAYTRAIL_ACCOUNT),
        "checkout-algorithm": "sha256",
        "checkout-method":    method,
        "checkout-nonce":     uuid.uuid4().hex,
        "checkout-timestamp": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    }


def compute_signature(headers: dict, body: str = "") -> str:
    """
    HMAC-SHA256 signature over sorted checkout- headers + body.
    """
    header_string = "\n".join(
        f"{k}:{v}"
        for k, v in sorted(headers.items())
        if k.startswith("checkout-")
    )
    payload = header_string + "\n" + body
    return hmac.new(
        settings.PAYTRAIL_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def create_payment(order, success_url: str, cancel_url: str) -> str | None:
    headers = make_headers("POST")

    full_name = order.get_customer_name().strip().split()
    first_name = full_name[0] if full_name else "Guest"
    last_name = full_name[-1] if len(full_name) > 1 else "-"

    stamp = f"order-{order.id}-{uuid.uuid4().hex[:8]}"

    # FIX 1: safe cents conversion from Decimal
    total_cents = int(Decimal(str(order.total)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP) * 100)

    # FIX 2: email is required by Paytrail — fallback to placeholder if missing
    customer_email = order.get_customer_email() or "noreply@example.com"
    customer_phone = order.get_customer_phone() or ""

    body = {
        "stamp":     stamp,
        "reference": f"ORDER-{order.order_number}",
        "amount":    total_cents,
        "currency":  "EUR",
        "language":  "FI",
        "customer": {
            "email":     customer_email,
            "firstName": first_name,
            "lastName":  last_name,
            # FIX 3: phone is optional in Paytrail — only include if present
            **({"phone": customer_phone} if customer_phone else {}),
        },
        "redirectUrls": {
            "success": success_url,
            "cancel":  cancel_url,
        },
        "callbackUrls": {
            "success": success_url,
            "cancel":  cancel_url,
        },
    }

    body_str = json.dumps(body, separators=(",", ":"))
    headers["signature"] = compute_signature(headers, body_str)

    try:
        response = requests.post(
            "https://services.paytrail.com/payments",
            headers={**headers, "Content-Type": "application/json; charset=utf-8"},
            data=body_str,
            timeout=10,
        )
        # FIX 4: log the actual Paytrail error response
        if not response.ok:
            logger.error("Paytrail error response: %s", response.text)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        logger.error("Paytrail create_payment failed: %s", e)
        return None

    order.paytrail_stamp = stamp
    order.paytrail_tx_id = data.get("transactionId", "")
    order.save(update_fields=["paytrail_stamp", "paytrail_tx_id"])

    return data.get("href")


def verify_callback(params: dict) -> bool:
    """
    Verifies the HMAC signature from Paytrail callback params.
    NOTE: Does NOT mutate the original params dict.
    """
    params = dict(params)  # copy so we don't mutate the original
    signature = params.pop("signature", "")
    if not signature:
        return False

    payload = "\n".join(
        f"{k}:{v}"
        for k, v in sorted(params.items())
        if k.startswith("checkout-")
    ) + "\n"

    expected = hmac.new(
        settings.PAYTRAIL_SECRET.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    return hmac.compare_digest(signature, expected)