from django.urls import path
from . import views

app_name = 'spotify'

urlpatterns = [
    path('link/', views.spotify_login, name='spotify-login'),
    path('callback/', views.spotify_callback, name='spotify-callback'),
    path('report/', views.recently_played, name='report'),
    path('wrap/generate/', views.generate_wrap, name='generate-wrap'),
    path('wrap/<int:wrap_id>/', views.view_wrap, name='view-wrap'),
    path('wrap/history/', views.wrap_history, name='wrap-history'),
]
