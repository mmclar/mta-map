from django.conf.urls.static import static
from django.urls import path

from frontend import views
from map import settings

urlpatterns = [
    path('', views.index),
] + static(settings.STATIC_URL)
