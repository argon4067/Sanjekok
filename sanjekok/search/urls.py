from django.urls import path
from . import views

urlpatterns = [
    path("search/api", views.place_search, name="search-api"),
    path("", views.search_page, name="search-page"),
]
