from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import logout_view, UserLogin, saveOrcamento, get_csrf_token
from . import viewset

router = DefaultRouter()
router.register(r'comidas', viewset.ComidaViewSet)
router.register(r'locais', viewset.LocalEventoAnnotatedViewSet)
router.register(r'logisticas', viewset.LogisticaAnnotatedViewSet)
router.register(r'logisticasWP', viewset.LogisticaAnnotatedViewSetWithoutPagination, basename='logisticasWP')
router.register(r'cidades', viewset.CidadeAnnotatedViewSet)
router.register(r'cidadesWP', viewset.CidadeWithoutPaginationAnnotatedViewSet, basename='cidadeWP')
router.register(r'localEventoWP', viewset.LocalEventoWithoutPaginationAnnotatedViewSet, basename='localEventoWP')
router.register(r'comidasWP', viewset.ComidaWithoutPaginationViewSet, basename='comidaWP')
router.register(r'clientes', viewset.ClienteAnnotatedViewSet)
router.register(r'clientesWP', viewset.ClienteWithoutPaginationAnnotatedViewSet, basename='clientesWP')
router.register(r'eventos', viewset.EventoAnnotatedViewSet)
router.register(r'orcamentos', viewset.OrcamentoAnnotatedViewSet)
urlpatterns = [
    path('', include(router.urls)),
    path('login/', UserLogin.as_view(), name='login'),
    path('logout/', logout_view, name='logout'),
    path('get-csrf-token/', get_csrf_token, name='get_csrf_token'),
    path('orcamentos-create/', saveOrcamento, name='save_orcamento'),
    path('logistica-cidade/<int:cidade_id>/', viewset.LogisticaCidadeByCidadeView.as_view(), name='logistica-cidade-by-cidade'),
]
