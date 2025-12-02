from django.urls import path
from . import views

app_name = "Stats"

urlpatterns = [
    path("", views.stats_home, name="stats_home"),
]


