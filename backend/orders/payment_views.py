# orders/payment_views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect
from .models import Order
from .paytrail import create_payment, verify_callback

class InitiatePaymentView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({"error": "Order not found"}, status=404)

        base = request.build_absolute_uri('/').rstrip('/')
        success_url = f"{base}/api/orders/payment/success/"
        cancel_url  = f"{base}/api/orders/payment/cancel/"

        href = create_payment(order, success_url, cancel_url)
        return Response({"payment_url": href})


class PaymentCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, result):
        params = dict(request.GET)
        params = {k: v[0] for k, v in params.items()}

        if not verify_callback(params):
            return Response({"error": "Invalid signature"}, status=400)

        stamp = params.get("checkout-stamp", "")
        order = Order.objects.filter(paytrail_stamp=stamp).first()

        if order:
            if result == "success":
                order.payment_status = "paid"
                order.status         = "confirmed"
            else:
                order.payment_status = "unpaid"
                order.status         = "cancelled"
            order.save()

        # Redirect to frontend
        from django.conf import settings as s
        frontend = getattr(s, 'FRONTEND_URL', 'http://localhost:5173')
        return redirect(f"{frontend}/order/{order.order_number}?payment={result}")