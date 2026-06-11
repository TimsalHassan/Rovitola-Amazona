import logging

from django.shortcuts import redirect
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from orders.models import Order
from .paytrail import create_payment, verify_callback
# from .tasks import send_payment_notification_email, send_payment_failed_email
from orders.tasks import send_order_received_email
from menu.models import MenuItem

logger = logging.getLogger(__name__)


class InitiatePaymentView(APIView):
    """
    POST /api/payments/<order_number>/initiate/
    Creates a Paytrail payment and returns the redirect URL.
    """
    permission_classes = [AllowAny]

    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({"error": "Order not found."}, status=404)

        # COD/Card on delivery ko Paytrail ki zaroorat nahi
        if order.payment_method in ["cash_on_delivery", "card_on_delivery"]:
            return Response({"error": "Online payment not required for this order."}, status=400)

        if order.payment_status == "paid":
            return Response({"error": "Order is already paid."}, status=400)

        # If already initiated, don't generate a new payment — return existing one
        # Just always create a fresh one but use the SAME stamp if exists
        base = settings.BACKEND_URL.rstrip("/")
        success_url = f"{base}/api/payments/callback/success/"
        cancel_url = f"{base}/api/payments/callback/cancel/"

        href = create_payment(order, success_url, cancel_url)

        if not href:
            logger.error(
                "Paytrail returned no href for order %s", order_number)
            return Response(
                {"error": "Payment gateway error. Please try again."},
                status=502,
            )

        return Response({"payment_url": href})


class PaymentCallbackView(APIView):
    """
    GET /api/payments/callback/success/
    GET /api/payments/callback/cancel/
    Paytrail redirects here after payment attempt.
    """
    permission_classes = [AllowAny]

    def get(self, request, result):
        params = {k: v[0] for k, v in dict(request.GET).items()}
        frontend = getattr(settings, "FRONTEND_URL", "http://localhost:5173")

        if not verify_callback(params):
            return redirect(f"{frontend}/payment-error?reason=invalid_signature")

        stamp = params.get("checkout-stamp", "")
        order = Order.objects.prefetch_related(
            "items").filter(paytrail_stamp=stamp).first()

        if not order:
            return redirect(f"{frontend}/payment-error?reason=order_not_found")

        if result == "success":
            # Guard against duplicate callbacks firing the email twice
            if order.payment_status != "paid":
                order.payment_status = "paid"
                order.status = "confirmed"
                order.save(update_fields=["payment_status", "status"])
                print(order.get_customer_email())

                customer_email = order.get_customer_email()
                if customer_email:
                    
                    raw_items = order.items.values(
                        "menu_item_name",
                        "quantity",
                        "base_price",
                        "total_price",
                    )

                    # Build a lookup: name → image URL from MenuItem
                    image_lookup = {
                        m.name: m.image.url if m.image else ""
                        for m in MenuItem.objects.filter(
                            name__in=[i["menu_item_name"] for i in raw_items]
                        )
                    }

                    items = [
                        {**item,
                            "menu_item_image": image_lookup.get(item["menu_item_name"], "")}
                        for item in raw_items
                    ]
                    send_order_received_email.delay(
                        order_id=order.order_number,
                        user_email=customer_email,
                        user_name=order.get_customer_name(),
                        order_type=order.order_type,
                        subtotal=str(order.subtotal),
                        delivery_charge=str(order.delivery_charge),
                        discount_amount=str(order.discount_amount),
                        total=str(order.total),
                        items=items,
                    )

        else:
            if order.payment_status != "paid":
                order.payment_status = "unpaid"
                order.save(update_fields=["payment_status"])

        # Paytrail server-to-server callback (no browser) → plain 200, no redirect
        if "Mozilla" not in request.META.get("HTTP_USER_AGENT", ""):
            return Response({"status": "ok"}, status=200)

        return redirect(f"{frontend}/order/{order.order_number}?payment={result}")
