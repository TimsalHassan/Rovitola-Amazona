from django.urls import path
from .views import (
    CategoryListView, 
    MenuItemListView, 
    MenuItemDetailView, 
    ExtraListView, 
    ExtraOptionListView
)

urlpatterns = [
    path("categories/", CategoryListView.as_view()),
    path("items/", MenuItemListView.as_view()),
    path("items/<int:pk>/", MenuItemDetailView.as_view()),
    path("extras/", ExtraListView.as_view()),
    path("extra-options/", ExtraOptionListView.as_view()),
]