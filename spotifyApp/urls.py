from django.urls import path
from . import views

app_name = 'spotify'

urlpatterns = [
    path('link/', views.spotify_login, name='spotify-login'),
    path('callback/', views.spotify_callback, name='spotify-callback'),
    path('report/', views.recently_played, name='report'),
]
