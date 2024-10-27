# myproject/urls.py
from django.contrib import admin
from django.urls import include, path
from django.shortcuts import render

def home(request):
    return render(request, 'home.html')

def contact(request):
    return render(request, 'contact.html')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', include('userAuth.urls')),
]