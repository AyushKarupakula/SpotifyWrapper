"""
URL configuration for spotifyWrapper project.

This module defines the URL routing for the Django application. 
The `urlpatterns` list routes URLs to their corresponding views or applications.

Routes:
    - Admin: Provides access to Django's admin interface.
    - User Authentication: Includes URLs for user authentication APIs.
    - Spotify API: Includes URLs for Spotify API integration.
    - Spotify Callback: Handles callback routing for Spotify OAuth.
    - Default Redirect: Redirects the base URL to the frontend application.

For more information, see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from django.views.generic import RedirectView

# URL patterns for the application
urlpatterns = [
    path('admin/', admin.site.urls),  # Django admin interface
    path('api/auth/', include('userAuth.urls')),  # User authentication endpoints
    path('api/spotify/', include('spotifyApp.urls')),  # Spotify API endpoints
    path('spotify/callback/', include('spotifyApp.urls')),  # Spotify OAuth callback
    path('', RedirectView.as_view(url='http://localhost:3000')),  # Redirect to frontend
]
