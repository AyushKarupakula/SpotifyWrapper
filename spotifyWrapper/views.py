# myproject/urls.py
from django.contrib import admin
from django.urls import include, path
from django.shortcuts import render

def home(request):
    """
    Returns the home.html page
    """
    return render(request, 'home.html')

def contact(request):
    """
    Returns the contact.html page
    """
    return render(request, 'contact.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', include('userAuth.urls')),
]