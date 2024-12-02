from django.urls import path
from . import views

app_name = 'spotify'

urlpatterns = [
    path('playlists/', views.get_playlists, name='playlists'),
    path('auth/', views.spotify_auth, name='spotify_auth'),
    path('callback/', views.spotify_callback, name='spotify_callback'),
    path('wrapped/', views.get_wrapped_data, name='wrapped'),
    path('wraps/', views.get_wrap_history, name='wrap-history'),
    path('wraps/<int:wrap_id>/', views.get_wrap_detail, name='wrap-detail'),
    path('wraps/latest/', views.get_latest_wrap, name='latest-wrap'),
    path('wraps/<int:wrap_id>/delete/', views.delete_wrap, name='delete-wrap'),
    path('wrapped/create/', views.create_wrapped_data, name='create-wrapped'),
]
