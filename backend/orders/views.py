from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer, OrderStatusSerializer
from cart.models import Cart
from .tasks import (
    send_order_received_email,
    send_restaurant_notification_email,
)


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        user = self.request.user

        # Logged-in user → return their orders
        if user.is_authenticated:
            return Order.objects.filter(customer=user).prefetch_related(
                "items__selected_options"
            )

        # Guest → return orders by phone number
        guest_phone = self.request.query_params.get("guest_phone")
        if guest_phone:
            return Order.objects.filter(guest_phone=guest_phone).prefetch_related(
                "items__selected_options"
            )
        
        guest_email = self.request.query_params.get("guest_email")
        if guest_email:
            return Order.objects.filter(guest_email=guest_email).prefetch_related(
                "items__selected_options"
            )

        return Order.objects.none()


class OrderCreateView(generics.CreateAPIView):
    serializer_class = CreateOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        # If offline payment → confirm immediately
        if order.payment_method in ["cash_on_delivery", "card_on_delivery"]:
            order.status = "confirmed"
            order.save(update_fields=["status"])
        # Online payment → stays pending until Paytrail callback

        # Customer email get karo
        customer_email = None
        if order.customer:
            customer_email = order.customer.email
        elif order.guest_email:
            customer_email = order.guest_email

        if customer_email:
            send_order_received_email.delay(
                order_id=order.order_number,
                user_email=customer_email,
                user_name=order.get_customer_name(),
                order_type=order.order_type,
                total=str(order.total),
            )

        # Build items list
        items_text = "\n".join([
            f"  • {item.menu_item_name} x{item.quantity} = €{item.total_price}"
            for item in order.items.all()
        ])
 
        send_restaurant_notification_email.delay(
            order_id=order.order_number,
            order_details=(
                f"Order Number : #{order.order_number}\n"
                f"Order Type   : {order.order_type.upper()}\n"
                f"Customer     : {order.get_customer_name()}\n"
                f"Phone        : {order.get_customer_phone()}\n"
                f"Email        : {order.get_customer_email()}\n"
                f"Address      : {order.delivery_address or 'N/A (Pickup)'}\n"
                f"Notes        : {order.order_notes or 'None'}\n\n"
                f"Items:\n{items_text}\n\n"
                f"Subtotal     : €{order.subtotal}\n"
                f"Delivery     : €{order.delivery_charge}\n"
                f"Discount     : -€{order.discount_amount}\n"
                f"TOTAL        : €{order.total}"
            ),
        )

        # Clear the customer's cart after successful order creation
        if request.user.is_authenticated:
            Cart.objects.filter(user=request.user).delete()
        else:
            session_key = request.session.session_key
            if session_key:
                Cart.objects.filter(session_key=session_key, user=None).delete()

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    lookup_field = "order_number"

    def get_queryset(self):
        qs = Order.objects.prefetch_related("items__selected_options").all()
        return qs

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.customer and (not user.is_authenticated or obj.customer != user):
            if not user.is_staff:
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied
        return obj


class OrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = OrderStatusSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "order_number"
    queryset = Order.objects.all()