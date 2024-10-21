from django.contrib.auth.views import LoginView
from django.shortcuts import render

class SpotifyLoginView(LoginView):
    template_name = 'userAuth/login.html'