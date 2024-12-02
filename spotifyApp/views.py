"""
Views module for the SpotifyWrapper project.

This module contains API views for interacting with the Spotify API and managing 
SpotifyWrap data, including authentication, fetching playlists, and managing user-generated wraps.
"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from django.conf import settings
import requests
import base64
import json
from urllib.parse import urlencode
from datetime import datetime
from .models import SpotifyWrap


class SpotifyAPI:
    """
    A helper class for interacting with the Spotify API.
    
    Methods:
        get_auth_url: Generates the Spotify authorization URL.
        get_access_token: Exchanges authorization code for access tokens.
        get_playlists: Fetches the user's playlists.
        get_headers: Generates headers for authenticated Spotify API requests.
        get_user_top_items: Retrieves top tracks or artists for the user.
        get_recently_played: Fetches recently played tracks.
        get_user_profile: Retrieves the user's profile information.
        get_user_playlists: Fetches user's playlists with a limit.
        get_track_preview: Fetches the preview URL for a specific track.
    """
    def __init__(self):
        self.client_id = settings.SPOTIFY_CLIENT_ID
        self.client_secret = settings.SPOTIFY_CLIENT_SECRET
        self.redirect_uri = settings.SPOTIFY_REDIRECT_URI
        self.base_url = 'https://api.spotify.com/v1'
        self.auth_url = 'https://accounts.spotify.com/authorize'
        self.token_url = 'https://accounts.spotify.com/api/token'

    def get_auth_url(self):
        """Generates the Spotify authorization URL."""
        params = {
            'client_id': self.client_id,
            'response_type': 'code',
            'redirect_uri': self.redirect_uri,
            'scope': ' '.join([
                'user-read-private',
                'user-read-email',
                'playlist-read-private',
                'playlist-modify-public',
                'playlist-modify-private',
                'user-top-read',
                'streaming',
                'user-read-playback-state',
                'user-modify-playback-state'
            ])
        }
        return f"{self.auth_url}?{urlencode(params)}"

    def get_access_token(self, code):
        """Exchanges the authorization code for an access token."""
        auth_header = base64.b64encode(
            f"{self.client_id}:{self.client_secret}".encode()
        ).decode()

        headers = {
            'Authorization': f'Basic {auth_header}',
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        data = {
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': self.redirect_uri
        }

        response = requests.post(self.token_url, headers=headers, data=data)
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Token Error: {response.text}")

    def get_playlists(self, access_token):
        """Fetches the user's playlists."""
        headers = self.get_headers(access_token)
        response = requests.get(f"{self.base_url}/me/playlists", headers=headers)
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Playlist Error: {response.text}")

    def get_headers(self, access_token):
        """Generates headers for authenticated Spotify API requests."""
        return {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    def get_user_top_items(self, access_token, item_type, time_range='medium_term', limit=20):
        """
        Retrieves the user's top tracks or artists.
        
        Args:
            item_type: 'tracks' or 'artists'.
            time_range: 'short_term', 'medium_term', or 'long_term'.
            limit: Maximum number of items to fetch.
        """
        headers = self.get_headers(access_token)
        response = requests.get(
            f'{self.base_url}/me/top/{item_type}',
            headers=headers,
            params={'time_range': time_range, 'limit': limit}
        )
        return response.json()

    def get_recently_played(self, access_token, limit=50):
        """Fetches recently played tracks."""
        headers = self.get_headers(access_token)
        response = requests.get(
            f'{self.base_url}/me/player/recently-played',
            headers=headers,
            params={'limit': limit}
        )
        return response.json()

    def get_user_profile(self, access_token):
        """Retrieves the user's profile information."""
        headers = self.get_headers(access_token)
        response = requests.get(f'{self.base_url}/me', headers=headers)
        return response.json()

    def get_user_playlists(self, access_token, limit=50):
        """Fetches the user's playlists with a specified limit."""
        headers = self.get_headers(access_token)
        response = requests.get(
            f'{self.base_url}/me/playlists',
            headers=headers,
            params={'limit': limit}
        )
        return response.json()

    def get_track_preview(self, track_id, access_token):
        """Fetches the preview URL for a specific track."""
        headers = self.get_headers(access_token)
        response = requests.get(f'{self.base_url}/tracks/{track_id}', headers=headers)
        if response.status_code == 200:
            track_data = response.json()
            return track_data.get('preview_url')
        return None


@api_view(['GET'])
@permission_classes([AllowAny])
def spotify_auth(request):
    """
    Generates the Spotify authorization URL for the user to authenticate.

    Returns:
        A JSON response containing the authorization URL.
    """
    try:
        spotify = SpotifyAPI()
        auth_url = spotify.get_auth_url()
        return Response({'auth_url': auth_url})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def spotify_callback(request):
    """
    Handles the Spotify OAuth callback, exchanges code for tokens, and stores them.

    Args:
        request: The HTTP request containing the authorization code.

    Returns:
        A JSON response indicating successful authentication.
    """
    try:
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'No authorization code provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        spotify = SpotifyAPI()
        token_info = spotify.get_access_token(code)
        request.session['spotify_token'] = token_info
        return Response({'message': 'Successfully authenticated with Spotify'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_playlists(request):
    """
    Retrieves the user's playlists from Spotify.

    Args:
        request: The HTTP request containing the user's session.

    Returns:
        A JSON response with the list of playlists or an error message.
    """
    try:
        token_info = request.session.get('spotify_token')
        if not token_info:
            return Response(
                {'error': 'Not authenticated with Spotify'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        spotify = SpotifyAPI()
        playlists = spotify.get_playlists(token_info['access_token'])
        return Response(playlists['items'])
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wrapped_data(request):
    """
    Fetches Spotify Wrapped data, including top tracks and artists for the user.

    Args:
        request: The HTTP request containing the user's session.

    Returns:
        A JSON response with the wrapped data or an error message.
    """
    try:
        spotify = SpotifyAPI()
        token_info = request.session.get('spotify_token')

        if not token_info:
            return Response(
                {'error': 'No Spotify token found. Please reconnect your account.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        access_token = token_info['access_token']
        wrapped_data = {
            'topTracksRecent': spotify.get_user_top_items(access_token, 'tracks', 'short_term', 20),
            'topTracksAllTime': spotify.get_user_top_items(access_token, 'tracks', 'long_term', 20),
            'topArtistsRecent': spotify.get_user_top_items(access_token, 'artists', 'short_term', 20),
            'topArtistsAllTime': spotify.get_user_top_items(access_token, 'artists', 'long_term', 20)
        }

        return Response(wrapped_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wrap_history(request):
    """
    Retrieves the user's SpotifyWrap history.

    Args:
        request: The HTTP request with the authenticated user's details.

    Returns:
        A JSON response containing the history of wraps or an error message.
    """
    try:
        wraps = SpotifyWrap.objects.filter(user=request.user).order_by('-date_generated')
        data = [{
            'id': wrap.id,
            'date_generated': wrap.date_generated.isoformat(),
            'title': wrap.title
        } for wrap in wraps]
        return Response({'wraps': data})
    except Exception as e:
        return Response({'error': 'Failed to fetch wrap history'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_wrap_detail(request, wrap_id):
    """
    Retrieves or deletes a specific SpotifyWrap.

    Args:
        request: The HTTP request with the authenticated user's details.
        wrap_id: The ID of the SpotifyWrap.

    Returns:
        A JSON response containing the wrap details, or a success message for deletion.
    """
    try:
        wrap = SpotifyWrap.objects.get(id=wrap_id, user=request.user)

        if request.method == 'DELETE':
            wrap.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        return Response(wrap.wrap_data)
    except SpotifyWrap.DoesNotExist:
        return Response(
            {'error': 'Wrap not found or you don\'t have permission to access it'},
            status=status.HTTP_404_NOT_FOUND
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_wrap(request):
    """
    Retrieves the latest SpotifyWrap for the authenticated user.

    Args:
        request: The HTTP request with the authenticated user's details.

    Returns:
        A JSON response containing the latest wrap or an error message.
    """
    try:
        latest_wrap = SpotifyWrap.objects.filter(user=request.user).latest('date_generated')
        return Response(latest_wrap.wrap_data)
    except SpotifyWrap.DoesNotExist:
        return Response({'error': 'No wrap found'}, status=status.HTTP_404_NOT_FOUND)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_wrap(request, wrap_id):
    """
    Deletes a specific SpotifyWrap.

    Args:
        request: The HTTP request with the authenticated user's details.
        wrap_id: The ID of the SpotifyWrap.

    Returns:
        A success message or an error message if the wrap is not found.
    """
    try:
        wrap = SpotifyWrap.objects.get(id=wrap_id, user=request.user)
        wrap.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except SpotifyWrap.DoesNotExist:
        return Response(
            {'error': 'Wrap not found or you don\'t have permission to delete it'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response({'error': 'Failed to delete wrap'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_wrapped_data(request):
    """
    Creates a new SpotifyWrap for the authenticated user.

    Args:
        request: The HTTP request containing the time range for the wrap.

    Returns:
        A JSON response with the created wrap data or an error message.
    """
    try:
        time_range = request.data.get('time_range', 'medium_term')
        if time_range not in ['short_term', 'medium_term', 'long_term']:
            return Response({'error': 'Invalid time range'}, status=status.HTTP_400_BAD_REQUEST)

        spotify = SpotifyAPI()
        token_info = request.session.get('spotify_token')

        if not token_info:
            return Response({'error': 'No Spotify token found'}, status=status.HTTP_401_UNAUTHORIZED)

        access_token = token_info['access_token']
        top_tracks = spotify.get_user_top_items(access_token, 'tracks', time_range, 20)
        top_artists = spotify.get_user_top_items(access_token, 'artists', time_range, 20)

        wrapped_data = {
            'topTracks': top_tracks,
            'topArtists': top_artists,
            'timeRange': time_range
        }

        wrap = SpotifyWrap.objects.create(
            user=request.user,
            wrap_data=wrapped_data,
            title=f"Wrap - {time_range} - {datetime.now().strftime('%Y-%m-%d')}"
        )

        return Response(wrapped_data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
