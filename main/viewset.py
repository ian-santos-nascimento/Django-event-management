from rest_framework import status
from rest_framework.authentication import TokenAuthentication, SessionAuthentication
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import Evento, Comida, LocalEvento, Cliente
from .serializers import EventoSerializer, ComidaSerializer, LocalEventoSerializer, ClienteSerializer


class EventoAnnotatedViewSet(ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evento = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class LocalEventoAnnotatedViewSet(ModelViewSet):
    queryset = LocalEvento.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated]
    serializer_class = LocalEventoSerializer
    authentication_classes = [SessionAuthentication]


class ClienteAnnotatedViewSet(ModelViewSet):
    queryset = Cliente.objects.all().order_by('nome')
    serializer_class = ClienteSerializer


class ComidaViewSet(ModelViewSet):
    queryset = Comida.objects.all().order_by('nome')
    serializer_class = ComidaSerializer
