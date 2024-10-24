from django.urls import path
from django.contrib.auth.views import LoginView, logout_then_login
from . import views

urlpatterns = [
    path('signup/', views.signup, name='signup'),
    path('login/', LoginView.as_view(template_name='userAuth/login.html'), name='login'),
    path('logout/', logout_then_login, {'login_url': 'login'}, name='logout'),
    path('account/', views.account, name='account'),
    path('delete/', views.delete, name='delete'),
]