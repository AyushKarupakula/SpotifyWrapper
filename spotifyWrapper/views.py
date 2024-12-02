# myproject/urls.py
from django.contrib import admin
from django.urls import include, path
from django.shortcuts import render

def home(request):
    
    """
    Home page view.

    Returns a rendered 'home.html' page.
    """
    return render(request, 'home.html')

def contact(request):
    """
    Contact page view.

    Returns a rendered 'contact.html' page.
    """
    return render(request, 'contact.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', include('userAuth.urls')),
]