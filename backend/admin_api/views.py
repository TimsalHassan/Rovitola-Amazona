from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.db.models import Count, Sum, Q
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView

from menu.models import Category, MenuItem, Extra, ExtraOption
from orders.models import Order
from reviews.models import Review
from contact.models import ContactMessage
from restaurant.models import RestaurantSettings, OpeningHours

from .serializers import (
    AdminUserSerializer,
    AdminCategorySerializer,
    AdminMenuItemListSerializer,
    AdminMenuItemWriteSerializer,
    AdminExtraSerializer,
    AdminExtraWriteSerializer,
    AdminExtraOptionSerializer,
    AdminOrderSerializer,
    AdminOrderStatusSerializer,
    AdminReviewSerializer,
    AdminContactMessageSerializer,
    AdminRestaurantSettingsSerializer,
    AdminOpeningHoursWriteSerializer,
    AdminDashboardStatsSerializer,
)

User = get_user_model()


class AdminPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 200


class AdminDashboardStatsView(APIView):
    """
    GET /api/admin/stats/
    Returns aggregated numbers for the dashboard stat cards.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        today = timezone.now().date()

        # "Earned" = paid online OR cash/card-on-delivery that reached delivered/completed
        # Excludes cancelled orders in both cases.
        earned_orders = Order.objects.filter(
            Q(payment_status="paid") |
            Q(payment_method__in=["cash_on_delivery", "card_on_delivery"],
              status__in=["delivered", "completed"])
        ).exclude(status="cancelled")

        today_earned = earned_orders.filter(created_at__date=today)

        stats = {
            "total_orders":     Order.objects.count(),
            "pending_orders":   Order.objects.filter(status="pending").count(),
            "confirmed_orders": Order.objects.filter(status="confirmed").count(),
            "total_revenue":    earned_orders.aggregate(s=Sum("total"))["s"] or 0,
            "today_revenue":    today_earned.aggregate(s=Sum("total"))["s"] or 0,
            "total_users":      User.objects.filter(is_staff=False).count(),
            "total_menu_items": MenuItem.objects.count(),
            "total_categories": Category.objects.count(),
            "unread_messages":  ContactMessage.objects.filter(is_read=False).count(),
            "pending_reviews":  Review.objects.filter(is_approved=False).count(),
        }
        serializer = AdminDashboardStatsSerializer(stats)
        return Response(serializer.data)


class AdminUserListView(generics.ListAPIView):
    """
    GET /api/admin/users/?search=…
    Returns all non-staff users (customers) with order count.
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = User.objects.all().order_by("-date_joined")
        search = self.request.query_params.get("search", "").strip()
        if search:
            qs = qs.filter(
                Q(name__icontains=search) | Q(email__icontains=search)
            )
        return qs


class AdminUserDetailView(generics.RetrieveUpdateAPIView):
    """
    GET  /api/admin/users/<id>/
    PATCH /api/admin/users/<id>/   — toggle is_staff, etc.
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminUserSerializer
    queryset = User.objects.all()
    http_method_names = ["get", "patch", "head", "options"]


class AdminCategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/categories/
    POST /api/admin/categories/
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminCategorySerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        return Category.objects.annotate(
        item_count=Count('items')
    ).order_by("order")

    def perform_create(self, serializer):
        serializer.save()
        cache.clear()  # invalidate menu cache


class AdminCategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/categories/<id>/
    PUT    /api/admin/categories/<id>/
    PATCH  /api/admin/categories/<id>/
    DELETE /api/admin/categories/<id>/
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminCategorySerializer
    queryset = Category.objects.all()

    def perform_update(self, serializer):
        serializer.save()
        cache.clear()

    def perform_destroy(self, instance):
        instance.delete()
        cache.clear()


class AdminMenuItemListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/menu-items/?search=…&category=…&is_available=…
    POST /api/admin/menu-items/   (multipart — image upload supported)
    """
    permission_classes = [IsAdminUser]
    pagination_class = AdminPagination

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminMenuItemWriteSerializer
        return AdminMenuItemListSerializer

    def get_queryset(self):
        qs = MenuItem.objects.select_related("category").order_by("category__order", "name")

        search = self.request.query_params.get("search", "").strip()
        category = self.request.query_params.get("category", "")
        is_available = self.request.query_params.get("is_available", "")
        is_lunch = self.request.query_params.get("is_lunch_item", "")

        if search:
            qs = qs.filter(Q(name__icontains=search) | Q(name_fi__icontains=search))
        if category:
            qs = qs.filter(category__slug=category)
        if is_available in ("true", "false"):
            qs = qs.filter(is_available=(is_available == "true"))
        if is_lunch in ("true", "false"):
            qs = qs.filter(is_lunch_item=(is_lunch == "true"))

        return qs

    def perform_create(self, serializer):
        serializer.save()
        cache.clear()


class AdminMenuItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/menu-items/<id>/
    PUT    /api/admin/menu-items/<id>/
    PATCH  /api/admin/menu-items/<id>/
    DELETE /api/admin/menu-items/<id>/
    """
    permission_classes = [IsAdminUser]
    queryset = MenuItem.objects.select_related("category")

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return AdminMenuItemWriteSerializer
        return AdminMenuItemListSerializer

    def perform_update(self, serializer):
        serializer.save()
        cache.clear()

    def perform_destroy(self, instance):
        instance.delete()
        cache.clear()


class AdminExtraListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/extras/?category=<slug>
    POST /api/admin/extras/
    """
    permission_classes = [IsAdminUser]
    pagination_class = None  # extras are always fetched in full

    def get_serializer_class(self):
        if self.request.method == "POST":
            return AdminExtraWriteSerializer
        return AdminExtraSerializer

    def get_queryset(self):
        qs = Extra.objects.select_related("category").prefetch_related("options")
        category_slug = self.request.query_params.get("category", "")
        if category_slug:
            qs = qs.filter(category__slug=category_slug)
        return qs.order_by("category__order", "order")

    def perform_create(self, serializer):
        serializer.save()
        cache.clear()


# Keep old name as alias so the URL import still works
AdminExtraListView = AdminExtraListCreateView


class AdminExtraDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/extras/<id>/
    PUT    /api/admin/extras/<id>/
    PATCH  /api/admin/extras/<id>/
    DELETE /api/admin/extras/<id>/
    """
    permission_classes = [IsAdminUser]
    queryset = Extra.objects.select_related("category").prefetch_related("options")

    def get_serializer_class(self):
        if self.request.method in ("PUT", "PATCH"):
            return AdminExtraWriteSerializer
        return AdminExtraSerializer

    def perform_update(self, serializer):
        serializer.save()
        cache.clear()

    def perform_destroy(self, instance):
        instance.delete()
        cache.clear()


class AdminExtraOptionListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/admin/extras/<extra_pk>/options/
    POST /api/admin/extras/<extra_pk>/options/
    """
    permission_classes = [IsAdminUser]
    pagination_class = None  # always return all options for an extra
    serializer_class = AdminExtraOptionSerializer

    def get_queryset(self):
        return ExtraOption.objects.filter(extra_id=self.kwargs["extra_pk"]).order_by("order")

    def perform_create(self, serializer):
        extra = Extra.objects.get(pk=self.kwargs["extra_pk"])
        serializer.save(extra=extra)
        cache.clear()


class AdminExtraOptionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/extras/<extra_pk>/options/<pk>/
    PUT    /api/admin/extras/<extra_pk>/options/<pk>/
    PATCH  /api/admin/extras/<extra_pk>/options/<pk>/
    DELETE /api/admin/extras/<extra_pk>/options/<pk>/
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminExtraOptionSerializer

    def get_queryset(self):
        return ExtraOption.objects.filter(extra_id=self.kwargs["extra_pk"])

    def perform_update(self, serializer):
        serializer.save()
        cache.clear()

    def perform_destroy(self, instance):
        instance.delete()
        cache.clear()


class AdminOrderListView(generics.ListAPIView):
    """
    GET /api/admin/orders/?status=…&order_type=…&payment_status=…&search=…
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminOrderSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = Order.objects.prefetch_related(
            "items__selected_options"
        ).select_related("customer").order_by("-created_at")

        status = self.request.query_params.get("status", "")
        order_type = self.request.query_params.get("order_type", "")
        payment_status = self.request.query_params.get("payment_status", "")
        payment_method = self.request.query_params.get("payment_method", "")
        search = self.request.query_params.get("search", "").strip()

        if status:
            qs = qs.filter(status=status)
        if order_type:
            qs = qs.filter(order_type=order_type)
        if payment_status:
            qs = qs.filter(payment_status=payment_status)
        if payment_method:
            qs = qs.filter(payment_method=payment_method)
        if search:
            qs = qs.filter(
                Q(order_number__icontains=search)
                | Q(guest_name__icontains=search)
                | Q(guest_email__icontains=search)
                | Q(guest_phone__icontains=search)
                | Q(customer__name__icontains=search)
                | Q(customer__email__icontains=search)
            )
        return qs


class AdminOrderDetailView(generics.RetrieveAPIView):
    """
    GET /api/admin/orders/<order_number>/
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminOrderSerializer
    queryset = Order.objects.prefetch_related("items__selected_options").select_related("customer")
    lookup_field = "order_number"


class AdminOrderStatusUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/admin/orders/<order_number>/status/
    Body: { "status": "confirmed" }  or  { "payment_status": "paid" }
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminOrderStatusSerializer
    queryset = Order.objects.all()
    lookup_field = "order_number"
    http_method_names = ["patch", "head", "options"]


class AdminReviewListView(generics.ListAPIView):
    """
    GET /api/admin/reviews/?approved=true|false
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminReviewSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = Review.objects.select_related("customer").order_by("-created_at")
        approved = self.request.query_params.get("approved", "")
        if approved in ("true", "false"):
            qs = qs.filter(is_approved=(approved == "true"))
        return qs


class AdminReviewDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/reviews/<id>/
    PATCH  /api/admin/reviews/<id>/  — { "is_approved": true/false }
    DELETE /api/admin/reviews/<id>/
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminReviewSerializer
    queryset = Review.objects.select_related("customer")
    http_method_names = ["get", "patch", "delete", "head", "options"]


class AdminContactMessageListView(generics.ListAPIView):
    """
    GET /api/admin/messages/?is_read=true|false
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminContactMessageSerializer
    pagination_class = AdminPagination

    def get_queryset(self):
        qs = ContactMessage.objects.order_by("-created_at")
        is_read = self.request.query_params.get("is_read", "")
        if is_read in ("true", "false"):
            qs = qs.filter(is_read=(is_read == "true"))
        return qs


class AdminContactMessageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/admin/messages/<id>/
    PATCH  /api/admin/messages/<id>/  — { "is_read": true }
    DELETE /api/admin/messages/<id>/
    """
    permission_classes = [IsAdminUser]
    serializer_class = AdminContactMessageSerializer
    queryset = ContactMessage.objects.all()
    http_method_names = ["get", "patch", "delete", "head", "options"]

    def retrieve(self, request, *args, **kwargs):
        """Auto-mark as read when fetched."""
        instance = self.get_object()
        if not instance.is_read:
            instance.is_read = True
            instance.save(update_fields=["is_read"])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class AdminRestaurantSettingsView(APIView):
    """
    GET   /api/admin/restaurant/
    PATCH /api/admin/restaurant/   — update any field(s)
    """
    permission_classes = [IsAdminUser]

    def _get_instance(self):
        instance = RestaurantSettings.get_settings()
        if not instance:
            from rest_framework.exceptions import NotFound
            raise NotFound("Restaurant settings not configured yet.")
        return instance

    def get(self, request):
        instance = self._get_instance()
        serializer = AdminRestaurantSettingsSerializer(instance)
        return Response(serializer.data)

    def patch(self, request):
        instance = self._get_instance()
        serializer = AdminRestaurantSettingsSerializer(
            instance, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        cache.delete("restaurant_info")
        return Response(serializer.data)

class AdminOpeningHoursBulkUpdateView(APIView):
    """
    PUT /api/admin/restaurant/hours/
    Body: list of { id?, day, is_closed, open_time, close_time, lunch_open, lunch_close }

    - Rows with an `id`   → update that OpeningHours record.
    - Rows without an `id` → create a new OpeningHours for this restaurant.
    - Existing DB rows whose id is absent from the payload → deleted.

    Response: { "updated": [...], "errors": [...] }
    """
    permission_classes = [IsAdminUser]

    def put(self, request):
        settings_obj = RestaurantSettings.get_settings()
        if not settings_obj:
            return Response({"detail": "Restaurant not configured."}, status=503)

        hours_data = request.data
        if not isinstance(hours_data, list):
            return Response({"detail": "Expected a list of opening hours."}, status=400)

        # Collect which real ids the client is keeping 
        submitted_ids = {
            int(item["id"])
            for item in hours_data
            if item.get("id") is not None
        }

        # Delete rows the client removed 
        OpeningHours.objects.filter(
            restaurant=settings_obj
        ).exclude(id__in=submitted_ids).delete()

        # Create / update the submitted rows
        updated = []
        errors = []

        for item in hours_data:
            row_id = item.get("id")

            try:
                if row_id is not None:
                    # --- UPDATE existing row ---
                    oh = OpeningHours.objects.get(id=int(row_id), restaurant=settings_obj)
                    serializer = AdminOpeningHoursWriteSerializer(
                        oh, data=item, partial=True
                    )
                    serializer.is_valid(raise_exception=True)
                    serializer.save()
                    updated.append(serializer.data)

                else:
                    # --- CREATE new row ---
                    data_with_restaurant = {**item, "restaurant": settings_obj.pk}
                    serializer = AdminOpeningHoursWriteSerializer(data=data_with_restaurant)
                    serializer.is_valid(raise_exception=True)
                    serializer.save(restaurant=settings_obj)
                    updated.append(serializer.data)

            except OpeningHours.DoesNotExist:
                errors.append({"id": row_id, "error": "Not found."})
            except Exception as e:
                errors.append({"id": row_id, "error": str(e)})

        cache.delete("restaurant_info")
        return Response({"updated": updated, "errors": errors})

    def patch(self, request):
        return self.put(request)


class AdminMenuItemToggleView(APIView):
    """
    PATCH /api/admin/menu-items/<id>/toggle/
    Flips is_available without sending the full form.
    """
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            item = MenuItem.objects.get(pk=pk)
        except MenuItem.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)

        item.is_available = not item.is_available
        item.save(update_fields=["is_available"])
        cache.clear()
        return Response({"id": item.pk, "is_available": item.is_available})