from rest_framework import filters
from rest_framework import generics
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from .serializers import *


class EventoAnnotatedViewSet(ModelViewSet):
    queryset = Evento.objects.all().order_by('codigo_evento')
    serializer_class = EventoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'codigo_evento', 'local__nome']

    def retrieve(self, request, pk=None):
        evento = Evento.objects.get(pk=pk)
        serializer = EventoClienteSerializer(evento)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def get_serializer_class(self):
        if self.action in ['list']:
            return EventoListSerializer
        return EventoSerializer


class OrcamentoAnnotatedViewSet(ModelViewSet):
    queryset = Orcamento.objects.all().order_by('-data_criacao')
    serializer_class = OrcamentoUnicoSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'cliente__nome', 'evento__nome', 'evento__codigo_evento']

    def retrieve(self, request, pk=None):
        orcamento = Orcamento.objects.get(pk=pk)
        serializer = OrcamentoUnicoSerializer(orcamento)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CidadeAnnotatedViewSet(ModelViewSet):
    queryset = Cidade.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = CidadeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', ]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.excluida = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CidadeWithoutPaginationAnnotatedViewSet(ReadOnlyModelViewSet):
    queryset = Cidade.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = CidadeSerializer

    pagination_class = None


class LogisticaCidadeByCidadeView(generics.GenericAPIView):
    serializer_class = LogisticaCidadeSerializer

    def get(self, request, cidade_id):
        try:
            logistica_cidade = LogisticaCidade.objects.get(cidade=cidade_id)
            serializer = self.get_serializer(logistica_cidade)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except LogisticaCidade.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)


class LogisticaAnnotatedViewSet(ModelViewSet):
    queryset = Logistica.objects.all().filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = LogisticaSerializar

    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', ]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.excluida = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LogisticaAnnotatedViewSetWithoutPagination(ReadOnlyModelViewSet):
    queryset = Logistica.objects.all().filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = LogisticaSerializar

    pagination_class = None


class LocalEventoWithoutPaginationAnnotatedViewSet(ReadOnlyModelViewSet):
    queryset = LocalEvento.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = LocalEventoSerializer

    pagination_class = None


class LocalEventoAnnotatedViewSet(ModelViewSet):
    queryset = LocalEvento.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = LocalEventoSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'cidade__nome']

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.excluida = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ClienteAnnotatedViewSet(ModelViewSet):
    queryset = Cliente.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated]
    serializer_class = ClienteEnderecoSerializer

    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'cnpj']


class ClienteWithoutPaginationAnnotatedViewSet(ReadOnlyModelViewSet):
    queryset = Cliente.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated]
    serializer_class = ClienteEnderecoSerializer

    pagination_class = None


class ComidaViewSet(ModelViewSet):
    queryset = Comida.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated]
    serializer_class = ComidaSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome']


class ComidaWithoutPaginationViewSet(ReadOnlyModelViewSet):
    queryset = Comida.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated]
    serializer_class = ComidaWithoutPaginationSerializer
    pagination_class = None
