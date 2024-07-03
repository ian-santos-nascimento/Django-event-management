from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import login_view, logout_view, UserLogin
from . import viewset

router = DefaultRouter()
router.register(r'comidas', viewset.ComidaViewSet)
router.register(r'locais', viewset.LocalEventoAnnotatedViewSet)
router.register(r'clientes', viewset.ClienteAnnotatedViewSet)
router.register(r'eventos', viewset.EventoAnnotatedViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
]
