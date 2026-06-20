from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Q

from .models import Order
from .serializers import OrderSerializer, CreateOrderSerializer, OrderStatusSerializer
from cart.models import Cart
from .tasks import send_order_received_email, send_restaurant_notification_email
from notifications.tasks import send_new_order_push

from rest_framework.exceptions import PermissionDenied, ValidationError
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt


class OrderListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    pagination_class = PageNumberPagination

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and user.is_staff:
            qs = Order.objects.prefetch_related("items__selected_options").order_by("-created_at")
            status_filter  = self.request.query_params.get("status")
            order_type     = self.request.query_params.get("order_type")
            payment_method = self.request.query_params.get("payment_method")
            payment_status = self.request.query_params.get("payment_status")
            search         = self.request.query_params.get("search", "").strip()
            if status_filter:   qs = qs.filter(status=status_filter)
            if order_type:      qs = qs.filter(order_type=order_type)
            if payment_method:  qs = qs.filter(payment_method=payment_method)
            if payment_status:  qs = qs.filter(payment_status=payment_status)
            if search:
                qs = qs.filter(
                    Q(order_number__icontains=search)
                    | Q(guest_phone__icontains=search)
                    | Q(guest_email__icontains=search)
                    | Q(guest_name__icontains=search)
                    | Q(customer__email__icontains=search)
                    | Q(customer__name__icontains=search)
                )
            return qs

        if user.is_authenticated:
            return (
                Order.objects.filter(customer=user)
                .prefetch_related("items__selected_options")
                .order_by("-created_at")
            )

        guest_phone = self.request.query_params.get("guest_phone", "").strip()
        guest_email = self.request.query_params.get("guest_email", "").strip()
        if not guest_phone and not guest_email:
            return Order.objects.none()
        filters = {}
        if guest_phone: filters["guest_phone"] = guest_phone
        if guest_email: filters["guest_email"] = guest_email
        return (
            Order.objects.filter(**filters)
            .prefetch_related("items__selected_options")
            .order_by("-created_at")
        )


OFFLINE_METHODS = {"cash_on_delivery", "cash_on_pickup"}


class OrderCreateView(generics.CreateAPIView):
    serializer_class = CreateOrderSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()

        is_offline = order.payment_method in OFFLINE_METHODS

        if is_offline:
            order.status = "confirmed"
            order.payment_status = "unpaid"  # will be collected at door/pickup
            order.save(update_fields=["status", "payment_status"])

            # Build items list for emails
            from menu.models import MenuItem
            raw_items = list(order.items.values(
                "menu_item_name", "quantity", "base_price", "total_price"
            ))
            image_map = {
                obj.name: obj.image.url if obj.image else None
                for obj in MenuItem.objects.filter(
                    name__in=[i["menu_item_name"] for i in raw_items]
                ).only("name", "image")
            }
            items = [
                {
                    **i,
                    "base_price": str(i["base_price"]),
                    "total_price": str(i["total_price"]),
                    "menu_item_image": image_map.get(i["menu_item_name"]),
                }
                for i in raw_items
            ]

            customer_email = order.get_customer_email()
            if customer_email:
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

            items_text = "\n".join([
                f"  • {i['menu_item_name']} x{i['quantity']} = €{i['total_price']}"
                for i in items
            ])
            send_restaurant_notification_email.delay(
                order_id=order.order_number,
                order_details=(
                    f"Order Number : #{order.order_number}\n"
                    f"Order Type   : {order.order_type.upper()}\n"
                    f"Payment      : {order.payment_method.replace('_', ' ').upper()}\n"
                    f"Customer     : {order.get_customer_name()}\n"
                    f"Phone        : {order.get_customer_phone()}\n"
                    f"Email        : {order.get_customer_email() or 'N/A'}\n"
                    f"Address      : {order.delivery_address or 'N/A (Pickup)'}\n"
                    f"Notes        : {order.order_notes or 'None'}\n\n"
                    f"Items:\n{items_text}\n\n"
                    f"Subtotal     : €{order.subtotal}\n"
                    f"Delivery     : €{order.delivery_charge}\n"
                    f"Discount     : -€{order.discount_amount}\n"
                    f"TOTAL        : €{order.total}"
                ),
            )

            send_new_order_push.delay(
                order_number=order.order_number,
                total=str(order.total),
                order_type=order.order_type,
            )

        # Clear cart
        if request.user.is_authenticated:
            Cart.objects.filter(user=request.user).delete()
        else:
            session_key = request.session.session_key
            if session_key:
                Cart.objects.filter(session_key=session_key, user=None).delete()

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)


class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [AllowAny]
    lookup_field = "order_number"

    def get_queryset(self):
        return Order.objects.prefetch_related("items__selected_options").all()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if obj.customer and (not user.is_authenticated or obj.customer != user):
            if not user.is_staff:
                raise PermissionDenied
        return obj


class OrderStatusUpdateView(generics.UpdateAPIView):
    serializer_class = OrderStatusSerializer
    permission_classes = [IsAdminUser]
    lookup_field = "order_number"
    queryset = Order.objects.all()


@method_decorator(csrf_exempt, name="dispatch")
class OrderCancelView(generics.UpdateAPIView):
    serializer_class = OrderStatusSerializer
    permission_classes = [AllowAny]
    lookup_field = "order_number"

    def get_queryset(self):
        return Order.objects.prefetch_related("items__selected_options").all()

    def get_object(self):
        obj = super().get_object()
        user = self.request.user
        if user.is_authenticated:
            if obj.customer and obj.customer != user and not user.is_staff:
                raise PermissionDenied
        else:
            guest_phone = self.request.data.get("guest_phone", "").strip()
            guest_email = self.request.data.get("guest_email", "").strip()
            if not guest_phone and not guest_email:
                raise PermissionDenied
            if obj.guest_phone != guest_phone and obj.guest_email != guest_email:
                raise PermissionDenied
        return obj

    def update(self, request, *args, **kwargs):
        order = self.get_object()
        if order.status not in ["pending", "confirmed"]:
            raise ValidationError(
                {"detail": "Order cannot be cancelled once it is being prepared."}
            )
        order.status = "cancelled"
        order.save(update_fields=["status", "updated_at"])
        return Response(OrderSerializer(order).data, status=status.HTTP_200_OK)