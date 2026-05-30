from django.urls import path
from .views import (
    OrderListView,
    OrderCreateView,
    OrderDetailView,
    OrderStatusUpdateView,
)
from .payment_views import InitiatePaymentView, PaymentCallbackView    

urlpatterns = [
    path("", OrderListView.as_view()),
    path("create/", OrderCreateView.as_view()),
    path("<str:order_number>/", OrderDetailView.as_view()),
    path("<str:order_number>/status/", OrderStatusUpdateView.as_view()),
    path("payment/<str:order_number>/initiate/", InitiatePaymentView.as_view()),
    path("payment/success/", PaymentCallbackView.as_view(), kwargs={"result": "success"}),
    path("payment/cancel/",  PaymentCallbackView.as_view(), kwargs={"result": "cancel"}),
]