from rest_framework import generics
from rest_framework.permissions import AllowAny

from .models import Category, MenuItem, Extra, ExtraOption
from .serializers import CategorySerializer, MenuItemSerializer, ExtraSerializer, ExtraOptionSerializer


class CategoryListView(generics.ListAPIView):
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    queryset = Category.objects.all().order_by("order")


class MenuItemListView(generics.ListAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = MenuItem.objects.select_related("category").all()

        category_slug = self.request.query_params.get("category")
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)

        is_lunch = self.request.query_params.get("is_lunch_item")
        if is_lunch is not None:
            queryset = queryset.filter(is_lunch_item=is_lunch.lower() == "true")

        is_available = self.request.query_params.get("is_available")
        if is_available is not None:
            queryset = queryset.filter(is_available=is_available.lower() == "true")

        return queryset


class MenuItemDetailView(generics.RetrieveAPIView):
    serializer_class = MenuItemSerializer
    permission_classes = [AllowAny]
    queryset = MenuItem.objects.select_related("category").all()


class ExtraListView(generics.ListAPIView):
    """Get all extras/customizations (Size, Toppings, Sauce, etc.), optionally filtered by category"""
    serializer_class = ExtraSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = Extra.objects.select_related("category").all()
        
        category_slug = self.request.query_params.get("category")
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        return queryset.order_by("category", "order")


class ExtraOptionListView(generics.ListAPIView):
    """Get all options for a specific extra/customization"""
    serializer_class = ExtraOptionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = ExtraOption.objects.select_related("extra").all()
        
        extra_id = self.request.query_params.get("extra")
        if extra_id:
            queryset = queryset.filter(extra_id=extra_id)
        
        return queryset.order_by("extra", "order")