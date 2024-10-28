import requests
from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
from django.urls import reverse
from urllib.parse import urlencode
from django.utils import timezone
from django.contrib.auth.decorators import login_required
from .models import SpotifyWrap
from django.contrib import messages

def spotify_login(request):
    scope = ' '.join([
        'user-read-recently-played',
        'user-top-read',
        'user-read-private',
        'user-read-email',
    ])
    query_params = urlencode({
        'client_id': settings.SPOTIFY_CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': settings.SPOTIFY_REDIRECT_URI,
        'scope': scope,
    })
    spotify_auth_url = f'https://accounts.spotify.com/authorize?{query_params}'
    return redirect(spotify_auth_url)


def spotify_callback(request):
    code = request.GET.get('code')
    error = request.GET.get('error')

    if error:
        # Handle the error case
        messages.error(request, f"Spotify authorization failed: {error}")
        return redirect('home')

    # Exchange the authorization code for an access token
    token_url = 'https://accounts.spotify.com/api/token'
    response = requests.post(
        token_url,
        data={
            'grant_type': 'authorization_code',
            'code': code,
            'redirect_uri': settings.SPOTIFY_REDIRECT_URI,
            'client_id': settings.SPOTIFY_CLIENT_ID,
            'client_secret': settings.SPOTIFY_CLIENT_SECRET,
        },
        headers={
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    )

    if response.status_code != 200:
        # Handle API error
        error_data = response.json()
        messages.error(request, f"Failed to get access token: {error_data.get('error_description', 'Unknown error')}")
        return redirect('home')

    token_data = response.json()
    access_token = token_data.get('access_token')
    
    if not access_token:
        messages.error(request, "No access token received from Spotify")
        return redirect('home')

    # Save the access token in session
    request.session['spotify_access_token'] = access_token
    
    return redirect('spotify:report')


def recently_played(request):
    access_token = request.session.get('spotify_access_token')

    if not access_token:
        return redirect('spotify-login')

    headers = {
        'Authorization': f'Bearer {access_token}',
    }
    response = requests.get('https://api.spotify.com/v1/me/player/recently-played', headers=headers)
    data = response.json()

    # Extract the track information from the response
    tracks = [
        {
            'name': item['track']['name'],
            'artist': item['track']['artists'][0]['name'],
        }
        for item in data.get('items', [])
    ]

    return render(request, 'spotifyApp/report.html', {'tracks': tracks})


def get_spotify_data(access_token):
    headers = {'Authorization': f'Bearer {access_token}'}
    
    # Get recently played
    recent = requests.get('https://api.spotify.com/v1/me/player/recently-played', headers=headers).json()
    
    # Get top tracks
    top_tracks = requests.get('https://api.spotify.com/v1/me/top/tracks', headers=headers).json()
    
    # Get top artists
    top_artists = requests.get('https://api.spotify.com/v1/me/top/artists', headers=headers).json()
    
    return {
        'recently_played': recent.get('items', []),
        'top_tracks': top_tracks.get('items', []),
        'top_artists': top_artists.get('items', [])
    }


@login_required
def generate_wrap(request):
    access_token = request.session.get('spotify_access_token')
    if not access_token:
        return redirect('spotify:spotify-login')
        
    data = get_spotify_data(access_token)
    
    # Create new wrap
    wrap = SpotifyWrap.objects.create(
        user=request.user,
        wrap_data=data,
        title=f"Wrap {timezone.now().strftime('%Y-%m-%d')}"
    )
    
    return redirect('spotify:view-wrap', wrap_id=wrap.id)

@login_required
def wrap_history(request):
    wraps = SpotifyWrap.objects.filter(user=request.user)
    return render(request, 'spotifyApp/wrap_history.html', {'wraps': wraps})

@login_required
def view_wrap(request, wrap_id):
    wrap = get_object_or_404(SpotifyWrap, id=wrap_id, user=request.user)
    return render(request, 'spotifyApp/wrap.html', {'wrap': wrap})
