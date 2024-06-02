from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import viewset

router = DefaultRouter()
router.register(r'comidas', viewset.ComidaViewSet)
router.register(r'locais', viewset.LocalEventoAnnotatedViewSet)
router.register(r'clientes', viewset.ClienteAnnotatedViewSet)
router.register(r'eventos', viewset.EventoAnnotatedViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('home', views.home, name='home'),
    path('login', views.user_login, name='user_login'),
    path('usuarios', views.user_list, name='user_list'),
    path('novoUsuario', views.user_create, name='user_create'),
    path('novoCliente', views.client_create, name='client_create'),
    path('novaComida', views.comida_create, name='comida_create'),
    path('comidaView', views.comida_list, name='comida_list'),
    path('locais', views.local_list, name='local_list'),
    path('clientes', views.client_list, name='client_list'),
    path('novoLocal', views.local_create, name='local_create'),
    path('novoEvento', views.evento_create, name='evento_create'),
]

