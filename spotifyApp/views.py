from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
import requests
import base64
import json
from urllib.parse import urlencode

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
            'scope': 'playlist-read-private playlist-modify-public playlist-modify-private',
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
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(f"{self.base_url}/me/playlists", headers=headers)
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Playlist Error: {response.text}")

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spotify_auth(request):
    try:
        spotify = SpotifyAPI()
        auth_url = spotify.get_auth_url()
        print("Generated Spotify Auth URL:", auth_url)
        print("Using Client ID:", settings.SPOTIFY_CLIENT_ID)
        print("Using Redirect URI:", settings.SPOTIFY_REDIRECT_URI)
        return Response({'auth_url': auth_url})
    except Exception as e:
        print("Spotify Auth Error:", str(e))
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def spotify_callback(request):
    try:
        code = request.data.get('code')
        if not code:
            return Response(
                {'error': 'No authorization code provided'},
                status=status.HTTP_400_BAD_REQUEST
            )

        spotify = SpotifyAPI()
        token_info = spotify.get_access_token(code)
        
        # Store token_info in session or database
        request.session['spotify_token'] = token_info
        
        return Response({'message': 'Successfully authenticated with Spotify'})
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_playlists(request):
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
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
