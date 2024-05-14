from django.urls import path
from . import views
urlpatterns = [
    path('', views.home, name='home'),
    path('home', views.home, name='home'),
    path('login', views.user_login, name='user_login'),
    path('usuarios', views.user_list, name='user_list'),
    path('clientes', views.client_list, name='client_list'),
    path('novoUsuario', views.user_create, name='user_create'),
    path('novoCliente', views.client_create, name='client_create'),
    path('novaComida', views.comida_create, name='comida_create'),
    path('comidas', views.comida_list, name='comida_list'),
]

