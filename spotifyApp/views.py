from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.conf import settings
from django.http import JsonResponse
import requests
import base64
import json
from urllib.parse import urlencode
from datetime import datetime
from .models import SpotifyWrap
import os

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


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
                'user-top-read'
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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
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
        print("Spotify callback error:", str(e))  # For debugging
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
        print(f"Using access token: {access_token[:10]}...")  # Debug log

        # Fetch data with error handling
        wrapped_data = {
            'topTracksRecent': spotify.get_user_top_items(
                access_token, 'tracks', 'short_term', 20
            ),
            'topTracksAllTime': spotify.get_user_top_items(
                access_token, 'tracks', 'long_term', 20
            ),
            'topArtistsRecent': spotify.get_user_top_items(
                access_token, 'artists', 'short_term', 20
            ),
            'topArtistsAllTime': spotify.get_user_top_items(
                access_token, 'artists', 'long_term', 20
            )
        }

        # Log the structure of the data
        print("Data structure:", {
            k: f"{len(v.get('items', []))} items" 
            for k, v in wrapped_data.items()
        })

        # Save to database
        wrap = SpotifyWrap.objects.create(
            user=request.user,
            wrap_data=wrapped_data,
            title=f"Wrap - {datetime.now().strftime('%Y-%m-%d')}"
        )
        print("Wrapped data saved to database", wrap)

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

def fetch_spotify_data(user_id):
    """Fetch user's top genres from Spotify API."""
    token_url = "https://accounts.spotify.com/api/token"
    auth_response = requests.post(
        token_url,
        data={"grant_type": "client_credentials"},
        auth=(SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET),
    )
    access_token = auth_response.json().get("access_token")

    user_url = f"https://api.spotify.com/v1/users/{user_id}/top/artists"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(user_url, headers=headers)

    # Extract genres
    if response.status_code == 200:
        genres = [genre for artist in response.json().get("items", []) for genre in artist.get("genres", [])]
        return list(set(genres))
    return []


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_personality_description(request):
    try:
        # Step 1: Retrieve latest wrap data
        latest_wrap = SpotifyWrap.objects.filter(user=request.user).latest('date_generated')
        wrap_data = latest_wrap.wrap_data

        # Extract genres
        genres = []
        for artist_data in wrap_data.get('topArtistsAllTime', {}).get('items', []):
            genres.extend(artist_data.get('genres', []))
        genres = list(set(genres))

        if not genres:
            return JsonResponse({"error": "No genres found in your Spotify data"}, status=400)

        # Step 2: Generate personality description using OpenAI
        prompt = f"Describe how someone who listens to {', '.join(genres)} tends to act, think, and dress."
        openai_url = "https://api.openai.com/v1/completions"
        response = requests.post(
            openai_url,
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
            json={
                "model": "text-davinci-003",
                "prompt": prompt,
                "max_tokens": 100,
            },
        )

        if response.status_code == 200:
            description = response.json().get("choices", [{}])[0].get("text", "").strip()
            return JsonResponse({"description": description})
        else:
            return JsonResponse({"error": "Failed to generate description with OpenAI"}, status=500)

    except SpotifyWrap.DoesNotExist:
        return JsonResponse({"error": "No Spotify data found. Please connect your account and generate a wrap."}, status=404)
    except requests.exceptions.RequestException as e:
        return JsonResponse({"error": f"Failed to connect to OpenAI API: {str(e)}"}, status=500)
    except Exception as e:
        return JsonResponse({"error": f"An unexpected error occurred: {str(e)}"}, status=500)
