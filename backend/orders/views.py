from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer, OrderStatusSerializer
from notifications.tasks import (
    send_order_received_email,
    send_restaurant_notification_email,
    send_order_confirmation_email,
    send_order_shipped_email,
    send_order_preparing_email,
    send_order_on_the_way_email,
    send_order_cancelled_email,
)

from payments.tasks import send_payment_notification_email


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]

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

        # Customer email get karo
        customer_email = None
        if order.customer:
            customer_email = order.customer.email
        elif order.guest_email:
            customer_email = order.guest_email

        if customer_email:
            items_text = "\n".join([
                f"- {item.menu_item_name} x{item.quantity} = €{item.total_price}"
                for item in order.items.all()
            ])

            send_order_received_email.delay(
                order_id=order.order_number,
                user_email=customer_email,
                user_name=order.get_customer_name(),
                order_type=order.order_type,
                total=str(order.total),
            )

        send_restaurant_notification_email.delay(
            order_id=order.order_number,
            order_details=f"New order #{order.order_number}\nType: {order.order_type}\nCustomer: {order.get_customer_name()}\nTotal: €{order.total}",
        )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_201_CREATED,
        )


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    lookup_field = "order_number"

    def get_queryset(self):
        return Order.objects.prefetch_related(
            "items__selected_options"
        ).all()


class OrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = OrderStatusSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "order_number"
    queryset = Order.objects.all()

    def update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        customer_email = None
        if order.customer:
            customer_email = order.customer.email
        elif order.guest_email:
            customer_email = order.guest_email

        if customer_email:
            items_text = "\n".join([
                f"- {item.menu_item_name} x{item.quantity} = €{item.total_price}"
                for item in order.items.all()
            ])

            if order.status == "confirmed":
                send_order_confirmation_email.delay(
                    order_id=order.order_number,
                    user_email=customer_email,
                    user_name=order.get_customer_name(),
                    items_text=items_text,
                    total=str(order.total),
                )

            if order.status == "preparing":
                send_order_preparing_email.delay(
                    order_id=order.order_number,
                    user_email=customer_email,
                    user_name=order.get_customer_name(),
                )

            if order.status == "on_the_way":
                send_order_on_the_way_email.delay(
                    order_id=order.order_number,
                    user_email=customer_email,
                    user_name=order.get_customer_name(),
                )

            if order.status == "delivered":
                send_order_shipped_email.delay(
                    order_id=order.order_number,
                    user_email=customer_email,
                    user_name=order.get_customer_name(),
                )

            if order.status == "cancelled":
                send_order_cancelled_email.delay(
                    order_id=order.order_number,
                    user_email=customer_email,
                    user_name=order.get_customer_name(),
                )

        return Response(
            OrderSerializer(order).data,
            status=status.HTTP_200_OK,
        )