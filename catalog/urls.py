from catalog import views
from django.urls import re_path

urlpatterns = [
    re_path(r"^api/public", views.public),
    re_path(r"^api/private", views.private),
]
