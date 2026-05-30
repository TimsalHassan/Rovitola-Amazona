from django.urls import path
from .views import ReviewListView, ReviewCreateView

urlpatterns = [
    path("", ReviewListView.as_view()),
    path("create/", ReviewCreateView.as_view()),
]