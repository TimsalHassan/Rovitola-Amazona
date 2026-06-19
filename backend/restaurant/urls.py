from django.urls import path
from .views import RestaurantInfoView, DeliveryCheckView, PickupSlotsView

urlpatterns = [
    path('info/', RestaurantInfoView.as_view(), name='restaurant-info'),
    path('delivery-check/', DeliveryCheckView.as_view(), name='delivery-check'),
    path('pickup-slots/', PickupSlotsView.as_view(), name='pickup-slots'),
]