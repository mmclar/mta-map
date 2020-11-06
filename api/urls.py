from django.urls import path

from api import views

urlpatterns = [
    path('train-locations/', views.train_locations),
]
