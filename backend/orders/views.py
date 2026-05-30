from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response

from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer, OrderStatusSerializer


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
    permission_classes = [AllowAny]   # guests can order too

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
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
        return super().update(request, *args, **kwargs)
