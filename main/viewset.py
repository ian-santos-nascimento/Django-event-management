from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework import generics
from rest_framework import filters
from .models import *
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

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        evento = serializer.save()
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class OrcamentoAnnotatedViewSet(ModelViewSet):
    queryset = Orcamento.objects.all().order_by('id_orcamento')
    permission_classes = [IsAuthenticated]
    serializer_class = OrcamentoSerializer
    authentication_classes = [SessionAuthentication]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'cliente__nome', 'evento__nome']


    def retrieve(self, request, pk=None):
        orcamento = Orcamento.objects.get(pk=pk)
        serializer = OrcamentoUnicoSerializer(orcamento)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CidadeAnnotatedViewSet(ModelViewSet):
    queryset = Cidade.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = CidadeSerializer
    authentication_classes = [SessionAuthentication]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome',]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.excluida = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CidadeWithoutPaginationAnnotatedViewSet(ReadOnlyModelViewSet):
    queryset = Cidade.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = CidadeSerializer
    authentication_classes = [SessionAuthentication]
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
    authentication_classes = [SessionAuthentication]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome',]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.excluida = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class LogisticaAnnotatedViewSetWithoutPagination(ReadOnlyModelViewSet):
    queryset = Logistica.objects.all().filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = LogisticaSerializar
    authentication_classes = [SessionAuthentication]
    pagination_class = None


class LocalEventoWithoutPaginationAnnotatedViewSet(ReadOnlyModelViewSet):
    queryset = LocalEvento.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = LocalEventoSerializer
    authentication_classes = [SessionAuthentication]
    pagination_class = None


class LocalEventoAnnotatedViewSet(ModelViewSet):
    queryset = LocalEvento.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = LocalEventoSerializer
    authentication_classes = [SessionAuthentication]
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
    authentication_classes = [SessionAuthentication]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'cnpj']


class ClienteWithoutPaginationAnnotatedViewSet(ReadOnlyModelViewSet):
    queryset = Cliente.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated]
    serializer_class = ClienteEnderecoSerializer
    authentication_classes = [SessionAuthentication]
    pagination_class = None


class ComidaViewSet(ModelViewSet):
    queryset = Comida.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated]
    serializer_class = ComidaSerializer
    authentication_classes = [SessionAuthentication]
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome']


class ComidaWithoutPaginationViewSet(ReadOnlyModelViewSet):
    queryset = Comida.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated]
    serializer_class = ComidaSerializer
    authentication_classes = [SessionAuthentication]
    pagination_class = None
