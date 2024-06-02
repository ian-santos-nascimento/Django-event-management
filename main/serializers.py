from rest_framework import serializers
from .models import Evento, Comida, LocalEvento, Cliente, ComidaEvento


class ComidaSerializer(serializers.ModelSerializer):
    comida_id = serializers.IntegerField()
    class Meta:
        model = Comida
        fields = ['comida_id', 'nome', 'descricao', 'valor', 'quantidade_minima']

class EventoSerializer(serializers.ModelSerializer):
    comidas = ComidaSerializer(many=True)

    class Meta:
        model = Evento
        fields = ['nome', 'descricao', 'observacao', 'comidas', 'cliente', 'qtd_dias_evento', 'local', 'data_inicio', 'data_fim']

    def create(self, validated_data):
        comidas_data = validated_data.pop('comidas')
        evento = Evento.objects.create(**validated_data)
        for comida_data in comidas_data:
            comida = Comida.objects.get(pk=comida_data['comida_id'])
            ComidaEvento.objects.create(evento=evento, comida=comida, valor=comida.valor, quantidade=comida.quantidade_minima)
        return evento


class LocalEventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocalEvento
        fields = '__all__'


class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'
