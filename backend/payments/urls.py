from django.urls import path
from .views import InitiatePaymentView, PaymentCallbackView

urlpatterns = [
    path('<str:order_number>/initiate/', InitiatePaymentView.as_view(), name='initiate-payment'),
    path('callback/success/', PaymentCallbackView.as_view(), kwargs={"result": "success"}, name='payment-success'),
    path('callback/cancel/', PaymentCallbackView.as_view(), kwargs={"result": "cancel"}, name='payment-cancel'),
]