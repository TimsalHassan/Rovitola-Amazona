from django.urls import path
from .views import RestaurantInfoView, DeliveryCheckView

urlpatterns = [
    path('info/', RestaurantInfoView.as_view(), name='restaurant-info'),
    path('delivery-check/', DeliveryCheckView.as_view(), name='delivery-check'),
]