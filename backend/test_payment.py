import hmac
import hashlib
import requests
import django
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from orders.models import Order
from django.conf import settings

def simulate_callback(order_number, result="success"):
    order = Order.objects.get(order_number=order_number)
    stamp = order.paytrail_stamp

    if not stamp:
        print("❌ No paytrail_stamp on order — did you initiate payment first?")
        return

    # Build params exactly as Paytrail would
    params = {
        "checkout-account":        str(settings.PAYTRAIL_ACCOUNT),
        "checkout-algorithm":      "sha256",
        "checkout-amount":         str(int(order.total * 100)),
        "checkout-stamp":          stamp,
        "checkout-reference":      f"ORDER-{order.order_number}",
        "checkout-transaction-id": order.paytrail_tx_id or "test-tx-id",
        "checkout-status":         "ok" if result == "success" else "fail",
        "checkout-provider":       "TEST",
    }

    # Compute signature
    payload = "\n".join(
        f"{k}:{v}" for k, v in sorted(params.items())
        if k.startswith("checkout-")
    ) + "\n"

    signature = hmac.new(
        settings.PAYTRAIL_SECRET.encode(),
        payload.encode(),
        hashlib.sha256,
    ).hexdigest()

    params["signature"] = signature

    # Hit your local callback endpoint
    url = f"http://localhost:8000/api/payments/callback/{result}/"
    response = requests.get(url, params=params, allow_redirects=False)

    print(f"\n{'✅ SUCCESS' if result == 'success' else '❌ CANCEL'} callback sent")
    print(f"Status code : {response.status_code}")
    print(f"Redirect to : {response.headers.get('Location', 'no redirect')}")

    # Check DB
    order.refresh_from_db()
    print(f"payment_status: {order.payment_status}")
    print(f"order status  : {order.status}")


if __name__ == "__main__":
    import sys
    order_number = sys.argv[1] if len(sys.argv) > 1 else input("Order number: ")
    result       = sys.argv[2] if len(sys.argv) > 2 else "success"
    simulate_callback(order_number, result)