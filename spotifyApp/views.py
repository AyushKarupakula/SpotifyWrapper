from django.shortcuts import render

def link_spotify_account(request):
    return render(request, 'spotifyApp/link.html')