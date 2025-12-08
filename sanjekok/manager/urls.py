from django.urls import path
from . import views

app_name = 'Manager'

urlpatterns = [
    path("", views.login, name='login'),
    path("main/", views.main, name='main'),
    path("dash/", views.dash, name='dash'),
    path("member/", views.member, name='member'),
    path("delete/<int:member_id>", views.delete, name='delete'),
    path("review/", views.review, name='review')
]
