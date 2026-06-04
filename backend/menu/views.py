from django.core.cache import cache
from rest_framework import generics
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import Category, MenuItem, Extra, ExtraOption
from .serializers import CategorySerializer, MenuItemSerializer, ExtraSerializer, ExtraOptionSerializer

CACHE_TTL = 60 * 15  # 15 minutes


# class CategoryListView(generics.ListAPIView):
#     serializer_class = CategorySerializer
#     permission_classes = [AllowAny]

#     def list(self, request, *args, **kwargs):
#         cache_key = "menu:categories"
#         data = cache.get(cache_key)
#         if data is None:
#             queryset = Category.objects.all().order_by("order")
#             data = CategorySerializer(queryset, many=True).data
#             cache.set(cache_key, data, CACHE_TTL)
#         return Response(data)

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


# class MenuItemListView(generics.ListAPIView):
#     serializer_class = MenuItemSerializer
#     permission_classes = [AllowAny]

#     def list(self, request, *args, **kwargs):
#         category_slug = request.query_params.get("category", "")
#         is_lunch = request.query_params.get("is_lunch_item", "")
#         is_available = request.query_params.get("is_available", "")

#         cache_key = f"menu:items:cat={category_slug}:lunch={is_lunch}:avail={is_available}"
#         data = cache.get(cache_key)

#         if data is None:
#             queryset = MenuItem.objects.select_related("category").all()
#             if category_slug:
#                 queryset = queryset.filter(category__slug=category_slug)
#             if is_lunch:
#                 queryset = queryset.filter(is_lunch_item=is_lunch.lower() == "true")
#             if is_available:
#                 queryset = queryset.filter(is_available=is_available.lower() == "true")

#             data = MenuItemSerializer(queryset, many=True).data
#             cache.set(cache_key, data, CACHE_TTL)

#         return Response(data)
    
# class MenuItemListView(generics.ListAPIView):
#     serializer_class = MenuItemSerializer
#     permission_classes = [AllowAny]

#     def list(self, request, *args, **kwargs):
#         category_slug = request.query_params.get("category", "")
#         is_lunch = request.query_params.get("is_lunch_item", "")
#         is_available = request.query_params.get("is_available", "")

#         cache_key = f"menu:items:cat={category_slug}:lunch={is_lunch}:avail={is_available}"
#         data = cache.get(cache_key)

#         if data is None:
#             queryset = MenuItem.objects.select_related("category").filter(is_menu_item=True)  # ← yahan
#             if category_slug:
#                 queryset = queryset.filter(category__slug=category_slug)
#             if is_lunch:
#                 queryset = queryset.filter(is_lunch_item=is_lunch.lower() == "true")
#             if is_available:
#                 queryset = queryset.filter(is_available=is_available.lower() == "true")

#             data = MenuItemSerializer(queryset, many=True).data
#             cache.set(cache_key, data, CACHE_TTL)

#         return Response(data)

class MenuItemListView(generics.ListAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]

    def list(self, request, *args, **kwargs):
        category_slug = request.query_params.get("category", "all")
        is_lunch = request.query_params.get("is_lunch_item", "any")
        is_available = request.query_params.get("is_available", "any")
        lang = request.query_params.get('language', 'en').lower()

        cache_key = f'menu_items_{category_slug}_{is_lunch}_{is_available}_{lang}'
        cached = cache.get(cache_key)

        if cached is not None:
            return Response(cached)

        queryset = MenuItem.objects.select_related("category").all()

        if category_slug != "all":
            queryset = queryset.filter(category__slug=category_slug)
        if is_lunch != "any":
            queryset = queryset.filter(is_lunch_item=is_lunch.lower() == "true")
        if is_available != "any":
            queryset = queryset.filter(is_available=is_available.lower() == "true")

        serializer = self.get_serializer(queryset, many=True)
        cache.set(cache_key, serializer.data, CACHE_TTL)
        return Response(serializer.data)


class MenuItemDetailView(generics.RetrieveAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]

    def retrieve(self, request, *args, **kwargs):
        pk = kwargs.get("pk")
        lang = request.query_params.get('language', 'en').lower()
        cache_key = f"menu:item:{pk}:{lang}"
        data = cache.get(cache_key)
        if data is None:
            instance = MenuItem.objects.select_related("category").get(pk=pk)
            data = MenuItemSerializer(instance, context={'request': request}).data
            cache.set(cache_key, data, CACHE_TTL)
        return Response(data)


# class ExtraListView(generics.ListAPIView):
#     serializer_class = ExtraSerializer
#     permission_classes = [AllowAny]

#     def list(self, request, *args, **kwargs):
#         category_slug = request.query_params.get("category", "")
#         cache_key = f"menu:extras:cat={category_slug}"
#         data = cache.get(cache_key)

#         if data is None:
#             queryset = Extra.objects.select_related("category").all()
#             if category_slug:
#                 queryset = queryset.filter(category__slug=category_slug)
#             queryset = queryset.order_by("category", "order")
#             data = ExtraSerializer(queryset, many=True).data
#             cache.set(cache_key, data, CACHE_TTL)

#         return Response(data)

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


# class ExtraOptionListView(generics.ListAPIView):
#     serializer_class = ExtraOptionSerializer
#     permission_classes = [AllowAny]

#     def list(self, request, *args, **kwargs):
#         extra_id = request.query_params.get("extra", "")
#         cache_key = f"menu:extra_options:extra={extra_id}"
#         data = cache.get(cache_key)

#         if data is None:
#             queryset = ExtraOption.objects.select_related("extra").all()
#             if extra_id:
#                 queryset = queryset.filter(extra_id=extra_id)
#             queryset = queryset.order_by("extra", "order")
#             data = ExtraOptionSerializer(queryset, many=True).data
#             cache.set(cache_key, data, CACHE_TTL)

#         return Response(data)

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
