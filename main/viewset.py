from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import ModelViewSet
from rest_framework import generics
from .models import *
from .serializers import *


class EventoAnnotatedViewSet(ModelViewSet):
    queryset = Evento.objects.all()
    serializer_class = EventoSerializer

    def retrieve(self, request, pk=None):
        print("AQUI REQUEST GET")
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
    queryset = Orcamento.objects.all()
    permission_classes = [IsAuthenticated]
    serializer_class = OrcamentoSerializer
    authentication_classes = [SessionAuthentication]


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
    serializer_class = LogissticaSerializar
    authentication_classes = [SessionAuthentication]

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.excluida = True
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class LocalEventoAnnotatedViewSet(ModelViewSet):
    queryset = LocalEvento.objects.all().order_by('nome').filter(excluida=False)
    permission_classes = [IsAuthenticated]
    serializer_class = LocalEventoSerializer
    authentication_classes = [SessionAuthentication]

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


class ComidaViewSet(ModelViewSet):
    queryset = Comida.objects.all().order_by('nome')
    permission_classes = [IsAuthenticated]
    serializer_class = ComidaSerializer
    authentication_classes = [SessionAuthentication]
