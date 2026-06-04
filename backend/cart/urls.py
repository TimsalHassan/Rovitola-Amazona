from django.urls import path
from .views import CartView, AddToCartView, CartItemView, MergeCartView

urlpatterns = [
    path('', CartView.as_view(), name='cart'),
    path('add/', AddToCartView.as_view(), name='cart-add'),
    path('items/<int:pk>/', CartItemView.as_view(), name='cart-item'),
    path('merge/', MergeCartView.as_view(), name='cart-merge'),
]