from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from .views import (
    OrderListView,
    OrderCreateView,
    OrderDetailView,
    OrderStatusUpdateView,
    OrderCancelView,
)

urlpatterns = [
    path("", OrderListView.as_view()),
    path("create/", OrderCreateView.as_view()),
    path("<str:order_number>/cancel/", csrf_exempt(OrderCancelView.as_view())),
    path("<str:order_number>/status/", OrderStatusUpdateView.as_view()),
    path("<str:order_number>/", OrderDetailView.as_view()),
]