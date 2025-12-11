from django.urls import path
from . import views

app_name = 'Reviews'

urlpatterns = [
    path("list/<int:hospital_id>/", views.review_list, name="review_list"),
    path("create/", views.review_create, name="review_create"),
    path("delete/", views.review_delete, name="review_delete"),
]
