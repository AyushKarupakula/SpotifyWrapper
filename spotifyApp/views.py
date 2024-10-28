import requests
from django.shortcuts import render, redirect
from django.conf import settings
from django.urls import reverse
from urllib.parse import urlencode

def spotify_login(request):
    scope = 'user-read-recently-played' # change this is accomodate required scope
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

    # Exchange the authorization code for an access token
    token_url = 'https://accounts.spotify.com/api/token'
    response = requests.post(token_url, data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': settings.SPOTIFY_REDIRECT_URI,
        'client_id': settings.SPOTIFY_CLIENT_ID,
        'client_secret': settings.SPOTIFY_CLIENT_SECRET,
    })

    token_data = response.json()
    access_token = token_data.get('access_token')

    # Save the access token in session (or database) for later use
    request.session['spotify_access_token'] = access_token

    return redirect(reverse('spotify:report'))  # Redirect to the report view


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