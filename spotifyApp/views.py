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
    def __init__(self):
        self.client_id = settings.SPOTIFY_CLIENT_ID
        self.client_secret = settings.SPOTIFY_CLIENT_SECRET
        self.redirect_uri = settings.SPOTIFY_REDIRECT_URI
        self.base_url = 'https://api.spotify.com/v1'
        self.auth_url = 'https://accounts.spotify.com/authorize'
        self.token_url = 'https://accounts.spotify.com/api/token'

    def get_auth_url(self):
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
        headers = self.get_headers(access_token)
        response = requests.get(f"{self.base_url}/me/playlists", headers=headers)
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Playlist Error: {response.text}")

    def get_headers(self, access_token):
        return {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }

    def get_user_top_items(self, access_token, item_type, time_range='medium_term', limit=20):
        headers = self.get_headers(access_token)
        response = requests.get(
            f'{self.base_url}/me/top/{item_type}',
            headers=headers,
            params={'time_range': time_range, 'limit': limit}
        )
        return response.json()

    def get_recently_played(self, access_token, limit=50):
        headers = self.get_headers(access_token)
        response = requests.get(
            f'{self.base_url}/me/player/recently-played',
            headers=headers,
            params={'limit': limit}
        )
        return response.json()

    def get_user_profile(self, access_token):
        headers = self.get_headers(access_token)
        response = requests.get(f'{self.base_url}/me', headers=headers)
        return response.json()

    def get_track_preview(self, track_id, access_token):
        headers = self.get_headers(access_token)
        response = requests.get(f'{self.base_url}/tracks/{track_id}', headers=headers)
        if response.status_code == 200:
            track_data = response.json()
            return track_data.get('preview_url')
        return None


@api_view(['GET'])
@permission_classes([AllowAny])
def spotify_auth(request):
    try:
        spotify = SpotifyAPI()
        auth_url = spotify.get_auth_url()
        return Response({'auth_url': auth_url})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def spotify_callback(request):
    try:
        code = request.data.get('code')
        if not code:
            return Response({'error': 'No authorization code provided'}, status=status.HTTP_400_BAD_REQUEST)

        spotify = SpotifyAPI()
        token_info = spotify.get_access_token(code)
        request.session['spotify_token'] = token_info
        return Response({'message': 'Successfully authenticated with Spotify'})
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_playlists(request):
    try:
        token_info = request.session.get('spotify_token')
        if not token_info:
            return Response({'error': 'Not authenticated with Spotify'}, status=status.HTTP_401_UNAUTHORIZED)

        spotify = SpotifyAPI()
        playlists = spotify.get_playlists(token_info['access_token'])
        return Response(playlists['items'])
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wrapped_data(request):
    try:
        spotify = SpotifyAPI()
        token_info = request.session.get('spotify_token')
        if not token_info:
            return Response({'error': 'No Spotify token found'}, status=status.HTTP_401_UNAUTHORIZED)

        access_token = token_info['access_token']

        top_tracks_recent = spotify.get_user_top_items(access_token, 'tracks', 'short_term', 20)

        wrapped_data = {
            'topTracksRecent': top_tracks_recent,
            'topTracksAllTime': top_tracks_recent,  # For demonstration
            'topArtistsRecent': spotify.get_user_top_items(access_token, 'artists', 'short_term', 20),
            'topArtistsAllTime': spotify.get_user_top_items(access_token, 'artists', 'long_term', 20)
        }

        wrap = SpotifyWrap.objects.create(
            user=request.user,
            wrap_data=wrapped_data,
            title=f"Wrap - {datetime.now().strftime('%Y-%m-%d')}"
        )

        return Response({'id': wrap.id, 'wrap_data': wrapped_data})

    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wrap_history(request):
    try:
        wraps = SpotifyWrap.objects.filter(user=request.user).order_by('-date_generated')
        data = [{'id': wrap.id, 'date_generated': wrap.date_generated.isoformat(), 'title': wrap.title} for wrap in wraps]
        return Response({'wraps': data})
    except Exception as e:
        return Response({'error': 'Failed to fetch wrap history'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)