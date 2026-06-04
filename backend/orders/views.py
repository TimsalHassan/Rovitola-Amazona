from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer, OrderStatusSerializer
from notifications.tasks import (
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