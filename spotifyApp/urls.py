from django.urls import path
from . import views

app_name = 'spotify'

urlpatterns = [
    path('api/spotify/login/', views.spotify_login, name='spotify-login'),
    path('api/spotify/callback/', views.spotify_callback, name='spotify-callback'),
    path('api/spotify/report/', views.recently_played, name='report'),
    path('api/spotify/wrap/generate/', views.generate_wrap, name='generate-wrap'),
    path('api/spotify/wrap/<int:wrap_id>/', views.view_wrap, name='view-wrap'),
    path('api/spotify/wrap/history/', views.wrap_history, name='wrap-history'),
]
