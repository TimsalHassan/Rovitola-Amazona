# orders/paytrail.py
import hmac, hashlib, json, uuid, requests
from datetime import datetime, timezone
from django.conf import settings

def make_headers(method):
    return {
        "checkout-account":   settings.PAYTRAIL_ACCOUNT,
        "checkout-algorithm": "sha256",
        "checkout-method":    method,
        "checkout-nonce":     str(uuid.uuid4()),
        "checkout-timestamp": datetime.now(timezone.utc).isoformat(),
    }

def sign(headers, body=""):
    data = "\n".join(
        f"{k}:{v}" for k, v in sorted(headers.items())
        if k.startswith("checkout-")
    ) + "\n" + body
    return hmac.new(
        settings.PAYTRAIL_SECRET.encode(),
        data.encode(),
        hashlib.sha256
    ).hexdigest()

def create_payment(order, success_url, cancel_url):
    headers  = make_headers("POST")
    name     = order.get_customer_name().split()
    body = {
        "stamp":     f"order-{order.id}-{uuid.uuid4().hex[:8]}",
        "reference": f"ORDER-{order.order_number}",
        "amount":    int(order.total * 100),
        "currency":  "EUR",
        "language":  "FI",
        "customer": {
            "email":     order.get_customer_email(),
            "firstName": name[0],
            "lastName":  name[-1] if len(name) > 1 else "",
            "phone":     order.get_customer_phone(),
        },
        "redirectUrls": {"success": success_url, "cancel": cancel_url},
        "callbackUrls": {"success": success_url, "cancel": cancel_url},
    }
    body_str           = json.dumps(body)
    headers["signature"] = sign(headers, body_str)

    res  = requests.post(
        "https://services.paytrail.com/payments",
        headers={**headers, "Content-Type": "application/json"},
        data=body_str
    )
    data = res.json()
    order.paytrail_stamp = body["stamp"]
    order.paytrail_tx_id = data.get("transactionId", "")
    order.save()
    return data.get("href")  # frontend isko redirect kare

def verify_callback(params: dict) -> bool:
    sig     = params.pop("signature", "")
    payload = "\n".join(
        f"{k}:{v}" for k, v in sorted(params.items())
        if k.startswith("checkout-")
    ) + "\n"
    expected = hmac.new(
        settings.PAYTRAIL_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(sig, expected)