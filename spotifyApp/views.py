from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import spotipy
from spotipy.oauth2 import SpotifyOAuth
from django.conf import settings
import json

def get_spotify_client(request):
    return spotipy.Spotify(auth_manager=SpotifyOAuth(
        client_id=settings.SPOTIFY_CLIENT_ID,
        client_secret=settings.SPOTIFY_CLIENT_SECRET,
        redirect_uri=settings.SPOTIFY_REDIRECT_URI,
        scope='playlist-read-private playlist-modify-public playlist-modify-private'
    ))

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_playlists(request):
    try:
        sp = get_spotify_client(request)
        playlists = sp.current_user_playlists()
        return Response(playlists['items'])
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def spotify_auth(request):
    sp_oauth = SpotifyOAuth(
        client_id=settings.SPOTIFY_CLIENT_ID,
        client_secret=settings.SPOTIFY_CLIENT_SECRET,
        redirect_uri=settings.SPOTIFY_REDIRECT_URI,
        scope='playlist-read-private playlist-modify-public playlist-modify-private'
    )
    auth_url = sp_oauth.get_authorize_url()
    return Response({'auth_url': auth_url})
