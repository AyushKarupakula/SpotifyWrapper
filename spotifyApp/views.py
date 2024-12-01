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
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
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
        """
        item_type: 'tracks' or 'artists'
        time_range: 'short_term' (4 weeks) or 'medium_term' (6 months) or 'long_term' (years)
        """
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

    def get_user_playlists(self, access_token, limit=50):
        headers = self.get_headers(access_token)
        response = requests.get(
            f'{self.base_url}/me/playlists',
            headers=headers,
            params={'limit': limit}
        )
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
        print("Debug Info:")
        print(f"Client ID: {settings.SPOTIFY_CLIENT_ID}")
        print(f"Redirect URI: {settings.SPOTIFY_REDIRECT_URI}")
        print(f"Generated Auth URL: {auth_url}")
        return Response({'auth_url': auth_url})
    except Exception as e:
        print(f"Error in spotify_auth: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([AllowAny])
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
        
        # Store token_info in session
        request.session['spotify_token'] = token_info
        
        return Response({'message': 'Successfully authenticated with Spotify'})
    except Exception as e:
        print("Spotify callback error:", str(e))
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wrapped_data(request):
    try:
        spotify = SpotifyAPI()
        token_info = request.session.get('spotify_token')
        
        if not token_info:
            return Response(
                {'error': 'No Spotify token found. Please reconnect your account.'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        access_token = token_info['access_token']

        # Fetch top tracks with preview URLs
        top_tracks_recent = spotify.get_user_top_items(
            access_token, 'tracks', 'short_term', 20
        )
        
        # Debug print before processing
        print("Raw track data:", json.dumps(top_tracks_recent['items'][0], indent=2))

        # Ensure preview URLs are present
        for track in top_tracks_recent.get('items', []):
            if not track.get('preview_url'):
                # Fetch individual track to get preview URL
                track_response = requests.get(
                    f'https://api.spotify.com/v1/tracks/{track["id"]}',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                if track_response.status_code == 200:
                    track_data = track_response.json()
                    track['preview_url'] = track_data.get('preview_url')
                    print(f"Updated preview URL for {track['name']}: {track['preview_url']}")

        # Debug print after processing
        print("Processed track data:", json.dumps(top_tracks_recent['items'][0], indent=2))

        wrapped_data = {
            'topTracksRecent': top_tracks_recent,
            'topTracksAllTime': top_tracks_recent,  # Using same data for demo
            'topArtistsRecent': spotify.get_user_top_items(
                access_token, 'artists', 'short_term', 20
            ),
            'topArtistsAllTime': spotify.get_user_top_items(
                access_token, 'artists', 'long_term', 20
            )
        }

        return Response(wrapped_data)

    except Exception as e:
        print(f"Error in get_wrapped_data: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_wrap_history(request):
    try:
        wraps = SpotifyWrap.objects.filter(user=request.user).order_by('-date_generated')
        data = [{
            'id': wrap.id,
            'date_generated': wrap.date_generated.isoformat(),
            'title': wrap.title
        } for wrap in wraps]
        return Response({'wraps': data})
    except Exception as e:
        print(f"Error in get_wrap_history: {str(e)}")  # Debug log
        return Response(
            {'error': 'Failed to fetch wrap history'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def get_wrap_detail(request, wrap_id):
    try:
        wrap = SpotifyWrap.objects.get(id=wrap_id, user=request.user)
        
        if request.method == 'DELETE':
            wrap.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
            
        # GET request
        return Response(wrap.wrap_data)
    except SpotifyWrap.DoesNotExist:
        return Response(
            {'error': 'Wrap not found or you don\'t have permission to access it'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_latest_wrap(request):
    try:
        latest_wrap = SpotifyWrap.objects.filter(user=request.user).latest('date_generated')
        wrap_data = latest_wrap.wrap_data
        
        # Ensure the data structure is correct
        formatted_data = {
            'topTracksRecent': wrap_data.get('topTracksRecent', {}).get('items', []),
            'topTracksAllTime': wrap_data.get('topTracksAllTime', {}).get('items', []),
            'topArtistsRecent': wrap_data.get('topArtistsRecent', {}).get('items', []),
            'topArtistsAllTime': wrap_data.get('topArtistsAllTime', {}).get('items', [])
        }
        
        return Response(formatted_data)
    except SpotifyWrap.DoesNotExist:
        return Response(
            {'error': 'No wrap found'}, 
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_wrap(request, wrap_id):
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
        print(f"Error deleting wrap: {str(e)}")  # Add logging
        return Response(
            {'error': 'Failed to delete wrap'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_wrapped_data(request):
    try:
        time_range = request.data.get('time_range', 'medium_term')
        if time_range not in ['short_term', 'medium_term', 'long_term']:
            return Response(
                {'error': 'Invalid time range'},
                status=status.HTTP_400_BAD_REQUEST
            )

        spotify = SpotifyAPI()
        token_info = request.session.get('spotify_token')
        
        if not token_info:
            return Response(
                {'error': 'No Spotify token found'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        access_token = token_info['access_token']

        # Get data for the specified time range
        top_tracks = spotify.get_user_top_items(
            access_token, 'tracks', time_range, 20
        )
        top_artists = spotify.get_user_top_items(
            access_token, 'artists', time_range, 20
        )

        # Fetch preview URLs for tracks
        for track in top_tracks.get('items', []):
            track_id = track['id']
            headers = spotify.get_headers(access_token)
            track_response = requests.get(
                f'{spotify.base_url}/tracks/{track_id}',
                headers=headers
            )
            if track_response.status_code == 200:
                track_data = track_response.json()
                track['preview_url'] = track_data.get('preview_url')
                print(f"Track: {track['name']}, Preview URL: {track['preview_url']}")  # Debug log

        wrapped_data = {
            'topTracks': top_tracks,
            'topArtists': top_artists,
            'timeRange': time_range
        }

        # Save to database
        wrap = SpotifyWrap.objects.create(
            user=request.user,
            wrap_data=wrapped_data,
            title=f"Wrap - {time_range} - {datetime.now().strftime('%Y-%m-%d')}"
        )

        print("Wrapped Data:", json.dumps(wrapped_data, indent=2))  # Debug log
        return Response(wrapped_data)

    except Exception as e:
        print(f"Error in create_wrapped_data: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
