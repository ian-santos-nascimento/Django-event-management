from django.urls import path
from . import views
urlpatterns = [
    path('', views.home, name='home'),
    path('home', views.home, name='home'),
    path('login', views.user_login, name='user_login'),
    path('usuarios', views.user_list, name='user_list'),
    path('novoUsuario', views.user_create, name='user_create'),
]

