from django.urls import path
from . import views

app_name = 'spotify'

urlpatterns = [
    path('playlists/', views.get_playlists, name='playlists'),
    path('auth/', views.spotify_auth, name='spotify_auth'),
    path('spotify/callback/', views.spotify_callback, name='spotify_callback'),
    
]
