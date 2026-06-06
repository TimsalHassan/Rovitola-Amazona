from django.core.cache import cache
from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from .models import Category, MenuItem, Extra, ExtraOption
from .serializers import CategorySerializer, MenuItemSerializer, ExtraSerializer, ExtraOptionSerializer

CACHE_TTL = 60 * 15  # 15 minutes


class MenuPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'  # frontend ?page_size=20 se change kar sake
    max_page_size = 100


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        lang = request.query_params.get('language', 'en').lower()
        cache_key = f'categories_{lang}'
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        queryset = Category.objects.all().order_by("order")
        serializer = self.get_serializer(queryset, many=True)
        cache.set(cache_key, serializer.data, CACHE_TTL)
        return Response(serializer.data)


class MenuItemListView(generics.ListAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]
    pagination_class = MenuPagination  # Cache nahi — pagination har page ke liye alag response deta hai

    def get_queryset(self):
        request = self.request
        category_slug = request.query_params.get("category", "all")
        is_lunch = request.query_params.get("is_lunch_item", "any")
        is_available = request.query_params.get("is_available", "any")

        queryset = MenuItem.objects.select_related("category").prefetch_related(
            "category__extras__options"
        ).all()

        if category_slug != "all":
            queryset = queryset.filter(category__slug=category_slug)
        if is_lunch != "any":
            queryset = queryset.filter(is_lunch_item=is_lunch.lower() == "true")
        if is_available != "any":
            queryset = queryset.filter(is_available=is_available.lower() == "true")

        return queryset

    # list() override nahi — DRF apni pagination automatically apply karega


class MenuItemDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = MenuItemSerializer
    queryset = MenuItem.objects.select_related("category")

    def get_permissions(self):
        if self.request.method in ("PUT", "PATCH"):
            return [IsAdminUser()]
        return [AllowAny()]

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get("pk")
        lang = request.query_params.get('language', 'en').lower()
        cache_key = f"menu:item:{pk}:{lang}"
        data = cache.get(cache_key)
        if data is None:
            instance = self.get_object()
            data = self.get_serializer(instance).data
            cache.set(cache_key, data, CACHE_TTL)
        return Response(data)

    def perform_update(self, serializer):
        instance = serializer.save()
        cache.clear()


class ExtraListView(generics.ListAPIView):
    serializer_class = ExtraSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        category_slug = request.query_params.get("category", "all")
        lang = request.query_params.get('language', 'en').lower()
        cache_key = f'extras_{category_slug}_{lang}'
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        queryset = Extra.objects.select_related("category").all()
        if category_slug != "all":
            queryset = queryset.filter(category__slug=category_slug)
        queryset = queryset.order_by("category", "order")

        serializer = self.get_serializer(queryset, many=True)
        cache.set(cache_key, serializer.data, CACHE_TTL)
        return Response(serializer.data)


class ExtraOptionListView(generics.ListAPIView):
    serializer_class = ExtraOptionSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        extra_id = request.query_params.get("extra", "all")
        lang = request.query_params.get('language', 'en').lower()
        cache_key = f'extra_options_{extra_id}_{lang}'
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        queryset = ExtraOption.objects.select_related("extra").all()
        if extra_id != "all":
            queryset = queryset.filter(extra_id=extra_id)
        queryset = queryset.order_by("extra", "order")

        serializer = self.get_serializer(queryset, many=True)
        cache.set(cache_key, serializer.data, CACHE_TTL)
        return Response(serializer.data)