from django.urls import path

from api import views

urlpatterns = [
    path('train-locations/<int:timestamp>', views.train_locations),
]
