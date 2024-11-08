# myproject/urls.py
from django.contrib import admin
from django.urls import include, path
from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import redirect


def home(request):
    return render(request, 'home.html')

def contact(request):
    return render(request, 'contact.html')

def spotify_callback(request):
    code = request.GET.get('code')
    if code:
        # Process the code (exchange it for an access token, etc.)
        # Redirect to another page after successful authorization
        return redirect('/dashboard/')
    else:
        return HttpResponse("No authorization code received")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', include('userAuth.urls')),
]