from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from .models import *
from .serializers import *


class EventoAnnotatedViewSet(ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evento = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class CidadeAnnotatedViewSet(ModelViewSet):
    queryset = Cidade.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = CidadeSerializer
    authentication_classes = [SessionAuthentication]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.excluida = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
