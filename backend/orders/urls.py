from django.urls import path
from .views import (
    OrderListView,
    OrderCreateView,
    OrderDetailView,
    OrderStatusUpdateView,
)

urlpatterns = [
    path("", OrderListView.as_view()),
    path("create/", OrderCreateView.as_view()),
    path("<str:order_number>/", OrderDetailView.as_view()),
    path("<str:order_number>/status/", OrderStatusUpdateView.as_view()),
]