from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import  logout_view, UserLogin, saveOrcamento
from . import viewset

router = DefaultRouter()
router.register(r'comidas', viewset.ComidaViewSet)
router.register(r'locais', viewset.LocalEventoAnnotatedViewSet)
router.register(r'logisticas', viewset.LogisticaAnnotatedViewSet)
router.register(r'cidades', viewset.CidadeAnnotatedViewSet)
router.register(r'clientes', viewset.ClienteAnnotatedViewSet)
router.register(r'eventos', viewset.EventoAnnotatedViewSet)
router.register(r'orcamentos', viewset.OrcamentoAnnotatedViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('login/', UserLogin.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('orcamentos-create/', saveOrcamento, name='save_orcamento'),
    path('logistica-cidade/<int:cidade_id>/', viewset.LogisticaCidadeByCidadeView.as_view(), name='logistica-cidade-by-cidade'),
]
