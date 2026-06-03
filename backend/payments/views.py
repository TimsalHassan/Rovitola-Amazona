from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect
from django.conf import settings

from orders.models import Order
from orders.paytrail import create_payment, verify_callback
from .tasks import send_payment_notification_email, send_payment_failed_email
from notifications.tasks import send_restaurant_notification_email


class InitiatePaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

        base = request.build_absolute_uri('/').rstrip('/')
        success_url = f"{base}/api/payments/callback/success/"
        cancel_url  = f"{base}/api/payments/callback/cancel/"

        href = create_payment(order, success_url, cancel_url)
        return Response({"payment_url": href})


class PaymentCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, result):
        params = {k: v[0] for k, v in dict(request.GET).items()}

        if not verify_callback(params):
            return Response({"error": "Invalid signature"}, status=400)

        stamp = params.get("checkout-stamp", "")
        order = Order.objects.filter(paytrail_stamp=stamp).first()

        if order:
            # Customer email get karo
            customer_email = None
            if order.customer:
                customer_email = order.customer.email
            elif hasattr(order, 'guest_email'):
                customer_email = order.guest_email

            if result == "success":
                order.payment_status = "paid"
                order.status = "confirmed"
                order.save()

                if customer_email:
                    send_payment_notification_email.delay(
                        order_id=order.order_number,
                        user_email=customer_email,
                        amount=order.total,
                    )

                # Restaurant ko bhi notify karo
                send_restaurant_notification_email.delay(
                    order_id=order.order_number,
                    order_details=f"Payment received for order #{order.order_number}\nType: {order.order_type}\nTotal: €{order.total}\nCustomer: {order.get_customer_name()}",
                )

            else:
                order.payment_status = "unpaid"
                order.status = "cancelled"
                order.save()

                if customer_email:
                    send_payment_failed_email.delay(
                        order_id=order.order_number,
                        user_email=customer_email,
                    )

        frontend = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
        return redirect(f"{frontend}/order/{order.order_number}?payment={result}")