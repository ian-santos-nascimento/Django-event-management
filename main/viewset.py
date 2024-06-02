from rest_framework import viewsets
from .models import Evento, Comida, LocalEvento, Cliente
from .serializers import EventoSerializer, ComidaSerializer, LocalEventoSerializer, ClienteSerializer


class EventoAnnotatedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

class LocalEventoAnnotatedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = LocalEvento.objects.all().order_by('nome')
    serializer_class = LocalEventoSerializer

class ClienteAnnotatedViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Cliente.objects.all().order_by('nome')
    serializer_class = ClienteSerializer

class ComidaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Comida.objects.all().order_by('nome')
    serializer_class = ComidaSerializer