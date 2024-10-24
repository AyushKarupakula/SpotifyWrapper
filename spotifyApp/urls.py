from django.urls import path
from . import views

urlpatterns = [
    path('link/', views.link_spotify_account, name='spotify_link'), # temp view function name
]
